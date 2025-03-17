import { IsOptional, IsString, IsArray, IsUUID } from 'class-validator';

export class UpdatePropertyDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true }) // Ensure all media IDs are UUIDs
  removeMediaIds?: string[];

  //   @IsOptional()
  //   @IsArray()
  //   @IsUUID('4', { each: true })
  //   addMediaIds?: string[];
}
