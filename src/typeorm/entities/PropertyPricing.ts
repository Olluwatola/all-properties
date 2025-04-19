import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Property } from './Property';
import { Currency } from './Currency';

export enum BaseUnit {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

@Entity()
export class PropertyPricing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Property, (property) => property.pricingOptions, {
    nullable: false,
    onDelete: 'SET NULL',
  })
  property: Property;

  @Column({ type: 'enum', enum: BaseUnit })
  base_unit: BaseUnit; // "day" | "week" | "month" | "year"

  @Column({ type: 'int' })
  amount_of_unit: number; // Example: 1 day, 7 days, etc.

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; // Price for the selected unit

  @ManyToOne(() => Currency, { nullable: false, onDelete: 'RESTRICT' })
  currency: Currency;

  @Column({ type: 'timestamp', nullable: true }) // Mark inactive pricing
  inactive_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
