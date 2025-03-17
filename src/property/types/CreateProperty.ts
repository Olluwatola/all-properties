export enum PropertyType {
  EVENT_HALL = 'eventhall',
  OPEN_SPACE = 'openspace',
  BUILDING_FLOOR = 'buildingfloor',
  APARTMENT = 'apartment',
  LAND_LEASE = 'landlease',
  BUILDING = 'building',
}

export type CreateProperty = {
  type: PropertyType;
  title: string;
  description: string;
  location: string;
  lga: string; // UUID
  media: string[]; // Array of UUIDs
  header: string; // UUID
};
