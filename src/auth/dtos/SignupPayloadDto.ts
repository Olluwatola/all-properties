import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class SignupPayloadDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => (value as string).trim().toLowerCase())
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsNotEmpty({ message: 'First name is required' })
  @Transform(({ value }) => (value as string).trim())
  firstName: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @Transform(({ value }) => (value as string).trim())
  lastName: string;

  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be a valid international format',
  })
  phoneNo?: string;
}
