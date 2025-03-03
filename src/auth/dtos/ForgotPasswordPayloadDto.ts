import { IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class ForgotPasswordPayloadDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => (value as string).trim().toLowerCase())
  email: string;
}
