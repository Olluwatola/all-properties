import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Booking,
  BookingStatus,
  PaymentStatus,
} from './../typeorm/entities/Booking';
import { PromoCode } from './../typeorm/entities/PromoCode';
import { Property } from './../typeorm/entities/Property';
import { PropertyBooked } from './../typeorm/entities/PropertyBooked';
import { PropertyPricing } from './../typeorm/entities/PropertyPricing';
import { User } from './../typeorm/entities/User';
import { MoreThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(PropertyBooked)
    private readonly propertyBookedRepository: Repository<PropertyBooked>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
  ) {}

  async getAllBookingsForProperty(propertyId: string, fromDate?: Date) {
    const bookedRecords = await this.propertyBookedRepository.find({
      where: {
        property: { id: propertyId },
        startDate: fromDate ? MoreThanOrEqual(fromDate) : undefined,
      },
    });

    return bookedRecords;
  }

  async createBooking(
    property: Property,
    renter: User,
    property_pricing: PropertyPricing,
    amount_of_purchase: number,
    // start_date: string,
    // end_date: string,
    total_cost: number,
    promo_applied: PromoCode,
    payable_total: number,
  ) {
    const booking = this.bookingRepository.create({
      property,
      renter: renter,
      property_pricing,
      amount_of_purchase,
      // start_date,
      // end_date,
      total_cost,
      status: BookingStatus.PENDING,
      promo_applied,
      payable_total,
      payment_status: PaymentStatus.PENDING,
    });

    return await this.bookingRepository.save(booking);
  }

  async createBookedRanges(
    startDates: string[],
    duration: number,
    booking: Booking,
    property: Property,
  ): Promise<PropertyBooked[]> {
    const propertyBookedDocs: PropertyBooked[] = [];

    console.log('in create booked ranges ');

    for (const date of startDates) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + duration - 1); // Inclusive of startDate
      console.log('in create booked ranges in the dates');

      const propertyBooked = this.propertyBookedRepository.create({
        property,
        booking,
        startDate: startDate.toDateString(),
        endDate: endDate.toDateString(),
      });

      propertyBookedDocs.push(propertyBooked);
    }

    console.log('in create booked ranges ensds ');

    return await this.propertyBookedRepository.save(propertyBookedDocs);
  }
  async getUserBookings(user: User): Promise<any[]> {
    const bookings = await this.bookingRepository.find({
      where: { renter: { id: user.id } },
      relations: ['property', 'property_pricing', 'property_booking_ranges'],
      order: { created_at: 'DESC' },
    });

    return bookings.map((booking) => {
      // Transform booking data for frontend display
      console.log(booking);
      return {
        id: booking.id,
        propertyName: booking.property.title,
        propertyImage: booking.property.header?.file_url || null,
        totalCost: booking.total_cost,
        payableAmount: booking.payable_total,
        status: booking.payment_status,
        createdAt: booking.created_at,
        // Get the earliest start date and latest end date from booked ranges
        startDate:
          booking?.property_booking_ranges?.length > 0
            ? new Date(
                Math.min(
                  ...booking.property_booking_ranges.map((r) =>
                    new Date(r.startDate).getTime(),
                  ),
                ),
              )
            : null,
        endDate:
          booking?.property_booking_ranges?.length > 0
            ? new Date(
                Math.max(
                  ...booking.property_booking_ranges.map((r) =>
                    new Date(r.endDate).getTime(),
                  ),
                ),
              )
            : null,
        // Add a flag to indicate if the booking can be canceled
        canCancel: this.canCancelBooking(booking),
      };
    });
  }

  /**
   * Get a specific booking by ID
   */
  async getBookingById(id: string): Promise<Booking> {
    const bookingReturned = await this.bookingRepository.findOne({
      where: { id },
      relations: [
        'renter',
        'property',
        'property.owner',
        'property.media',
        'property_pricing',
        'property_booking_ranges',
        'promo_applied',
      ],
    });
    if (!bookingReturned) {
      throw new NotFoundException('property booking not found');
    }

    return bookingReturned;
  }

  /**
   * Check if a booking can be canceled
   */
  private canCancelBooking(booking: Booking): boolean {
    // Can only cancel if status is CONFIRMED
    if (booking.status !== BookingStatus.CONFIRMED) {
      return false;
    }

    // Can only cancel if no booked ranges have started yet
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Beginning of today

    return !booking.property_booking_ranges.some((range) => {
      const startDate = new Date(range.startDate);
      startDate.setHours(0, 0, 0, 0);
      return startDate <= now;
    });
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(booking: Booking, user: User): Promise<any> {
    // Check if the booking can be canceled
    if (!this.canCancelBooking(booking)) {
      throw new BadRequestException('This booking cannot be canceled');
    }

    // Update status to CANCELED
    booking.status = BookingStatus.CANCELED;
    booking.canceledAt = new Date();

    // Save the updated booking
    await this.bookingRepository.save(booking);

    // Delete booked ranges to free up the property
    await this.propertyBookedRepository.remove(booking.property_booking_ranges);

    // Here you could add logic to initiate refunds if necessary
    // this.paymentService.initiateRefund(booking);

    return {
      message: 'Booking canceled successfully',
      bookingId: booking.id,
    };
  }
}
