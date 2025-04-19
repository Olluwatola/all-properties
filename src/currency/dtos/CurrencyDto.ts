import { Length } from '@nestjs/class-validator';
import { Transform } from 'class-transformer';
import { IsBoolean, isBoolean, IsString } from 'class-validator';

export class CreateCurrencyDto {
  @IsString()
  @Length(3, 3, { message: 'Short code must be exactly 3 characters long' })
  short_code: string;

  @IsString()
  name: string;
}

export class ToggleCurrencyDto {
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return null;
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    throw new Error('inactiveNow must be a boolean');
  })
  @IsBoolean({ message: 'inactiveNow must be a boolean' })
  inactiveNow: boolean;
}
