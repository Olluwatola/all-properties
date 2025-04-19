import { IsOptional } from '@nestjs/class-validator';
import { Optional } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  IsUUID,
  ArrayNotEmpty,
  ValidateIf,
} from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  @IsNotEmpty()
  pricingId: string; // The ID of the pricing plan

  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({ each: true })
  @ValidateIf((obj) => Array.isArray(obj.startDates)) // Ensures it's a valid array
  startDates: string[]; // Array of start dates

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => {
    return Number(value);
  })
  amountOfPurchase: number; // The number of bookings being made

  @IsOptional()
  @IsString()
  promoCode?: string; // Optional promo code
}

export class CancelBookingDto {
  @IsOptional()
  @IsString()
  cancelReason?: string;
}

// If you need response DTOs for structured responses
export class BookingResponseDto {
  id: string;
  propertyName: string;
  propertyImage: string;
  totalCost: number;
  payableAmount: number;
  status: string;
  createdAt: Date;
  startDate: Date;
  endDate: Date;
  canCancel: boolean;
}

export class BookingDetailResponseDto extends BookingResponseDto {
  propertyDescription: string;
  propertyLocation: string;
  propertyOwner: string;
  bookedDates: { startDate: Date; endDate: Date }[];
  paymentDetails: {
    paymentId: string;
    status: string;
    paidAmount: number;
    paidAt: Date;
  }[];
}
