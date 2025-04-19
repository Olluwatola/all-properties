import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  DeleteDateColumn,
  OneToOne,
} from 'typeorm';
import { State } from './State';
import { LGA } from './LGA';
import { Media } from './Media';
import { User } from './User';
import { PropertyPricing } from './PropertyPricing';

export enum PropertyType {
  EVENT_HALL = 'eventhall',
  OPEN_SPACE = 'openspace',
  BUILDING_FLOOR = 'buildingfloor',
  APARTMENT = 'apartment',
  LAND_LEASE = 'landlease',
  BUILDING = 'building',
}

export enum PropertyApprovalType {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity()
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: PropertyType })
  type: PropertyType;

  @Column()
  title: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  owner: User;

  @OneToMany(() => PropertyPricing, (pricing) => pricing.property, {
    cascade: false,
  })
  pricingOptions: PropertyPricing[];

  @Column({ type: 'text' })
  description: string;

  @Column()
  location: string;

  @ManyToOne(() => State, { nullable: false, onDelete: 'CASCADE' })
  state: State;

  @ManyToOne(() => LGA, { nullable: false, onDelete: 'CASCADE' })
  lga: LGA;

  @OneToMany(() => Media, (media) => media.property, { cascade: true })
  media: Media[];

  @OneToOne(() => Media, (media) => media.property)
  header: Media;

  @Column({ type: 'enum', enum: PropertyApprovalType })
  approval: PropertyApprovalType;

  @Column({ nullable: true })
  approvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
