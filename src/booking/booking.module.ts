import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './../typeorm/entities/Booking';
import { User } from './../typeorm/entities/User';
import { PromoCode } from './../typeorm/entities/PromoCode';
import { PropertyPricing } from './../typeorm/entities/PropertyPricing';
import { PaymentModule } from './../payment/payment.module';
import { Property } from './../typeorm/entities/Property';
import { PropertyModule } from './../property/property.module';
import { PropertyBooked } from './../typeorm/entities/PropertyBooked';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      User,
      PromoCode,
      PropertyPricing,
      Property,
      PropertyBooked,
    ]),
    PaymentModule,
    PropertyModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
