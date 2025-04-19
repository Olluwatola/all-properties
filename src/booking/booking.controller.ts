import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Req,
  MethodNotAllowedException,
  ForbiddenException,
  InternalServerErrorException,
  Param,
  UseGuards,
  Get,
  NotFoundException,
  Put,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Booking } from '../typeorm/entities/Booking';
import { PropertyPricing } from '../typeorm/entities/PropertyPricing';
import { PropertyBooked } from '../typeorm/entities/PropertyBooked';
import { PaymentService } from '../payment/payment.service';
import { ConfigService } from '@nestjs/config';
import { BookingService } from './booking.service';
import { User } from 'src/typeorm/entities/User';
import { Request } from 'express';
import { PromoCode, PromoType } from 'src/typeorm/entities/PromoCode';
import { CreateBookingDto } from './dtos/BookingDto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';

@Controller('booking')
export class BookingController {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(PropertyPricing)
    private readonly pricingRepository: Repository<PropertyPricing>,
    @InjectRepository(PropertyBooked)
    private readonly propertyBookedRepository: Repository<PropertyBooked>,
    private readonly paymentService: PaymentService,
    private readonly bookingService: BookingService,
    private readonly configService: ConfigService,
  ) {}

  @Post(':propertyId')
  @UseGuards(JwtAuthGuard)
  async createBooking(
    @Body() body: CreateBookingDto,
    @Req() req: Request,
    @Param('propertyId') propertyId: string,
  ) {
    const { pricingId, startDates, amountOfPurchase, promoCode } = body;
    if (!propertyId) {
      throw new ForbiddenException('property id not provided');
    }
    if (
      !startDates ||
      !Array.isArray(startDates) ||
      startDates.length !== amountOfPurchase
    ) {
      throw new BadRequestException('Invalid start dates provided.');
    }

    const pricing = await this.pricingRepository.findOne({
      where: { id: pricingId },
      relations: ['property', 'currency'], // Specify the relation you want to populate
    });

    if (!pricing) {
      throw new BadRequestException('Invalid property pricing.');
    }

    if (pricing.property.id !== propertyId) {
      throw new BadRequestException(
        'price requested does not belong to property requested',
      );
    }

    // Validate dates based on duration (day, week, month, year)
    const durationMap = { day: 1, week: 7, month: 30, year: 365 };
    const duration = durationMap[pricing.base_unit];
    if (!duration) {
      throw new BadRequestException('Invalid duration type.');
    }
    const actDuration = pricing.amount_of_unit * duration;

    startDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    for (let i = 0; i < startDates.length; i++) {
      const startDate = new Date(startDates[i]);
      const today12AMUTC = new Date();
      today12AMUTC.setUTCHours(0, 0, 0, 0); // Sets the time to 12 AM UTC
      if (startDate < today12AMUTC)
        throw new ForbiddenException('you cannot book a date in the past');
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + actDuration);
      for (let j = i + 1; j < startDates.length; j++) {
        const nextStartDate = new Date(startDates[j]);
        if (nextStartDate < endDate) {
          throw new BadRequestException('Selected dates cannot overlap.');
        }
      }
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log(today);
    // Fetch existing bookings for this property from today onwards
    const bookedRecords = await this.bookingService.getAllBookingsForProperty(
      propertyId,
      today,
    );

    console.log(bookedRecords);

    // Check for overlap between requested booking periods and existing ones
    for (const date of startDates) {
      const startDateOfNew = new Date(date);
      // Ensure startDateOfNew has time set to 00:00:00 for consistent comparison
      startDateOfNew.setHours(0, 0, 0, 0);

      const endDateOfNew = new Date(startDateOfNew);
      endDateOfNew.setDate(endDateOfNew.getDate() + actDuration);

      console.log(
        'New booking attempt:',
        startDateOfNew.toISOString(),
        endDateOfNew.toISOString(),
      );

      // Debug existing bookings
      console.log('Existing bookings:');
      bookedRecords.forEach((record) => {
        console.log(
          `- ${record.id}: ${record.startDate.toString()} to ${record.endDate.toString()}`,
        );
      });

      const isOverlap = bookedRecords.some((record) => {
        // Convert string dates to Date objects
        const recordStartDate = new Date(record.startDate);
        // Ensure recordStartDate has time set to 00:00:00
        recordStartDate.setHours(0, 0, 0, 0);

        const recordEndDate = new Date(record.endDate);
        // Ensure recordEndDate has time set to 00:00:00
        recordEndDate.setHours(0, 0, 0, 0);

        console.log(
          `Checking against: ${recordStartDate.toISOString()} to ${recordEndDate.toISOString()}`,
        );

        // Use a more explicit overlap check
        const hasOverlap =
          // Case 1: New booking starts during an existing booking
          (startDateOfNew >= recordStartDate &&
            startDateOfNew < recordEndDate) ||
          // Case 2: New booking ends during an existing booking
          (endDateOfNew > recordStartDate && endDateOfNew <= recordEndDate) ||
          // Case 3: New booking completely contains an existing booking
          (startDateOfNew <= recordStartDate && endDateOfNew >= recordEndDate);

        console.log(`Overlap with ${record.id}? ${hasOverlap}`);
        return hasOverlap;
      });

      console.log('Final overlap result:', isOverlap);
      if (isOverlap) {
        throw new BadRequestException(
          `Property is already booked between ${startDateOfNew.toDateString()} and ${endDateOfNew.toDateString()}.`,
        );
      }
    }

    const totalCost = pricing.price * amountOfPurchase;
    let payableTotal = totalCost;
    let promoCodeDoc;
    if (promoCode) {
      const promoRewards = await this.paymentService.getPromocode(promoCode);

      if (
        promoRewards.promotype === PromoType.LISTER &&
        pricing.property.owner.id !== promoRewards.entity_value
      ) {
        throw new ForbiddenException(
          'promocode does not apply to this property lister',
        );
      }
      if (
        promoRewards.promotype === PromoType.PROPERTY &&
        pricing.property.id !== promoRewards.entity_value
      ) {
        throw new ForbiddenException(
          'promocode does not apply to this property',
        );
      }
      payableTotal = Math.ceil(totalCost * (promoRewards.percentageoff / 100));
      promoCodeDoc = promoRewards.promoDoc;
    }

    //create Booking
    const newBooking = await this.bookingService.createBooking(
      pricing.property,
      req.user as User,
      pricing,
      amountOfPurchase,
      //startDates as [string],
      totalCost,
      promoCodeDoc,
      payableTotal,
    );

    // Process payment using the PaymentService
    const payment = await this.paymentService.makePaymentWithPaystack(
      newBooking,
      req.user as User,
      amountOfPurchase,
      pricing.price,
      payableTotal,
      pricing,
      (req.user as User).email,
      promoCodeDoc,
    );

    await this.bookingService.createBookedRanges(
      startDates,
      actDuration,
      newBooking,
      pricing.property,
    );

    return { message: 'Booking created', paymentUrl: payment.paymentUrl };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserBookings(@Req() req: Request) {
    // Get all bookings for the authenticated user
    return await this.bookingService.getUserBookings(req.user as User);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getBookingDetails(@Param('id') id: string, @Req() req: Request) {
    // Get specific booking details
    const booking = await this.bookingService.getBookingById(id);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check if user is authorized to view this booking
    if (booking.renter.id !== (req.user as User).id) {
      throw new ForbiddenException(
        'You are not authorized to view this booking',
      );
    }

    return booking;
  }

  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelBooking(@Param('id') id: string, @Req() req: Request) {
    // Cancel booking if it hasn't started yet
    const booking = await this.bookingService.getBookingById(id);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check if user is authorized to cancel this booking
    if (booking.renter.id !== (req.user as User).id) {
      throw new ForbiddenException(
        'You are not authorized to cancel this booking',
      );
    }

    // Check if booking can be canceled (hasn't started yet)
    return this.bookingService.cancelBooking(booking, req.user as User);
  }
}
