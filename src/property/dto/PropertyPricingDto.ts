import { IsEnum, IsInt, IsNumber, IsUUID, Min } from 'class-validator';
import { BaseUnit } from './../../typeorm/entities/PropertyPricing';
import { Type } from 'class-transformer';

export class CreatePricingDto {
  @IsEnum(BaseUnit)
  base_unit: BaseUnit;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  amount_of_unit: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  price: number;

  @IsUUID()
  currency: string;
}

export class UpdatePricingDto {
  @IsNumber()
  amount_of_unit?: number;

  @IsNumber()
  price?: number;
}
