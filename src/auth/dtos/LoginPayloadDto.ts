import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginPayloadDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => (value as string).trim().toLowerCase())
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
