import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Payment,
  PaymentProvider,
  PaymentStatus,
} from '../typeorm/entities/Payment';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/typeorm/entities/User';
import { Property } from 'src/typeorm/entities/Property';
import { Booking } from 'src/typeorm/entities/Booking';
import { PromoCode, PromoType } from 'src/typeorm/entities/PromoCode';
import { PropertyPricing } from 'src/typeorm/entities/PropertyPricing';
import { randomInt } from 'crypto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(PromoCode)
    private readonly promocodeRepository: Repository<PromoCode>,
    private readonly configService: ConfigService,
  ) {}

  async getPromocode(code: string): Promise<{
    promotype: PromoType;
    percentageoff: number;
    entity_value?: number | string;
    promoDoc: PromoCode;
  }> {
    const promocodeFetched = await this.promocodeRepository.findOne({
      where: { id: code },
    });

    if (!promocodeFetched) {
      throw new NotFoundException('Promocode not found');
    }

    // Check if promocode is expired
    if (
      promocodeFetched.inactive_at &&
      promocodeFetched.inactive_at < new Date()
    ) {
      throw new BadRequestException('Promocode is inactive');
    }

    // Check if expires_at is defined and validate expiry
    if (
      promocodeFetched.expires_at &&
      promocodeFetched.expires_at < new Date()
    ) {
      throw new BadRequestException('Promocode has expired');
    }

    // Validate the remaining usage
    if (promocodeFetched.amount_of_use_left <= 0) {
      throw new BadRequestException('Promocode has been fully used');
    }

    // Validate type-specific requirements
    if (
      promocodeFetched.type === PromoType.PROPERTY &&
      !promocodeFetched.property
    ) {
      throw new InternalServerErrorException(
        'This promocode is tied to a specific property, but none was found',
      );
    }

    if (
      promocodeFetched.type === PromoType.LISTER &&
      !promocodeFetched.lister
    ) {
      throw new InternalServerErrorException(
        'This promocode is tied to a specific lister, but none was found',
      );
    }

    // Validation passed, return the promocode
    return {
      promotype: promocodeFetched.type,
      percentageoff: promocodeFetched.percentage_off,
      entity_value:
        promocodeFetched.type === PromoType.PROPERTY
          ? promocodeFetched?.property?.id
          : promocodeFetched.type === PromoType.LISTER
            ? promocodeFetched?.lister?.id
            : undefined,
      promoDoc: promocodeFetched,
    };
  }

  async makePaymentWithPaystack(
    booking: Booking,
    user: User,
    amount_purchased: number,
    individual_cost: number,
    payable_total: number,
    propertyPricing: PropertyPricing,
    email: string,
    promocode_applied?: PromoCode,
  ) {
    const paystackSecret = this.configService.get<string>('PAYSTACK_SECRET');
    const reference = `txn_${Date.now()}_${randomInt(9).toString() + randomInt(9).toString()}`;

    try {
      const paymentResponse = await axios
        .post(
          'https://api.paystack.co/transaction/initialize',
          {
            email,
            amount: payable_total * 100, // Convert to kobo
            currency: 'NGN',
            callback_url: 'https://yourwebsite.com/payment-success',
            reference,
          },
          { headers: { Authorization: `Bearer ${paystackSecret}` } },
        )
        .catch((err) => {
          throw new InternalServerErrorException(err);
        });

      // Create a payment record
      const payment = this.paymentRepository.create({
        booking,
        user,
        amount_purchased,
        individual_cost: individual_cost * 1,
        subtotal: amount_purchased * individual_cost,
        payable_total,
        promocode_applied: promocode_applied ? promocode_applied : undefined,
        propertyPricing,
        status: PaymentStatus.PENDING,
        tx_ref: reference,
        provider: PaymentProvider.PAYSTACK,
        currency: propertyPricing.currency,
      });
      await this.paymentRepository.save(payment).catch((err) => {
        throw new InternalServerErrorException(err);
      });

      return {
        message: 'Payment initialized',
        paymentUrl: paymentResponse.data.data.authorization_url,
      };
    } catch (error) {
      throw new BadRequestException('Payment initialization failed.');
    }
  }
}
