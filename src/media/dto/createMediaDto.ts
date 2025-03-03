import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateMediaDto {
  @IsEnum(['public', 'private'])
  privacy_type: 'public' | 'private';

  @IsEnum(['app', 'user', 'dispute'])
  recipient_type: 'app' | 'user' | 'dispute';

  @IsOptional()
  @IsString()
  recipient_user_id?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
