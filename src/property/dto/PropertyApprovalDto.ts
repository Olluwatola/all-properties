import { IsEnum } from 'class-validator';
import { PropertyApprovalType } from '../../typeorm/entities/Property';

export class PropertyApprovalDto {
  @IsEnum(PropertyApprovalType)
  status: PropertyApprovalType;
}
