import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsUUID,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export enum PropertyType {
  EVENT_HALL = 'eventhall',
  OPEN_SPACE = 'openspace',
  BUILDING_FLOOR = 'buildingfloor',
  APARTMENT = 'apartment',
  LAND_LEASE = 'landlease',
  BUILDING = 'building',
}

export class CreatePropertyDto {
  @IsEnum(PropertyType)
  type: PropertyType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  //@IsUUID()
  //state: string;

  @IsUUID()
  lga: string;

  //   @IsArray()
  //   @ArrayNotEmpty()
  //   @IsUUID({}, { each: true })
  //   media: string[];

  //   @IsUUID()
  //   header: string;
}
