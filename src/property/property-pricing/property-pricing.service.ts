import {
  ForbiddenException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundError } from 'rxjs';
import { Property } from 'src/typeorm/entities/Property';
import { PropertyPricing } from 'src/typeorm/entities/PropertyPricing';
import { Repository } from 'typeorm';
import { CreatePricingDto, UpdatePricingDto } from '../dto/PropertyPricingDto';
import { User } from 'src/typeorm/entities/User';
import { Currency } from 'src/typeorm/entities/Currency';
import { CurrencyService } from 'src/currency/currency.service';

@Injectable()
export class PropertyPricingService {
  constructor(
    @InjectRepository(PropertyPricing)
    private pricingRepo: Repository<PropertyPricing>,
    @InjectRepository(Property) private propertyRepo: Repository<Property>,
    //@InjectRepository(Property) private currencyRepo: Repository<Currency>,
    private currencyService: CurrencyService,
  ) {}

  /** 🔹 Add Pricing */
  async addPricing(
    propertyId: string,
    createDto: CreatePricingDto,
    user: User,
  ) {
    const property = await this.propertyRepo.findOne({
      where: { id: propertyId },
      relations: ['owner'],
    });

    if (!property) throw new NotFoundException('Property not found');
    if (property.owner.id !== user.id)
      throw new ForbiddenException('Only the owner can add pricing');

    const currency = await this.currencyService.findCurrencyById(
      createDto.currency,
    );

    if (!currency) throw new NotFoundException('currency not found');
    if (currency.inactive_at)
      throw new ForbiddenException('currency not available');
    const pricing = this.pricingRepo.create({
      ...createDto,
      currency,
      property,
    });
    return this.pricingRepo.save(pricing);
  }

  /** 🔹 Fetch Pricing Options */
  async getAllPricing(propertyId: string, user: User) {
    const property = await this.propertyRepo.findOne({
      where: { id: propertyId },
      relations: ['owner'],
    });

    if (!property) throw new NotFoundException('Property not found');

    if (property.owner.id !== user.id)
      throw new ForbiddenException('Only the owner can add pricing');
    // Owners see all pricing

    return this.pricingRepo.find({
      where: { property },
      relations: ['currency'],
    });
  }

  /** 🔹 Update Pricing */
  async updatePricing(
    pricingId: string,
    updateDto: UpdatePricingDto,
    user: User,
  ) {
    const pricing = await this.pricingRepo.findOne({
      where: { id: pricingId },
      relations: ['property', 'property.owner'],
    });

    if (!pricing) throw new NotFoundException('Pricing not found');
    if (pricing.property.owner.id !== user.id)
      throw new ForbiddenException('Only the owner can update pricing');

    Object.assign(pricing, updateDto);
    return this.pricingRepo.save(pricing);
  }

  /** 🔹 Soft Delete (Make Inactive) */
  async softDeletePricing(pricingId: string, user: User) {
    const pricing = await this.pricingRepo.findOne({
      where: { id: pricingId },
      relations: ['property', 'property.owner'],
    });

    if (!pricing) throw new NotFoundException('Pricing not found');
    if (pricing.property.owner.id !== user.id)
      throw new ForbiddenException('Only the owner can remove pricing');

    pricing.inactive_at = new Date();
    return this.pricingRepo.save(pricing);
  }
}
