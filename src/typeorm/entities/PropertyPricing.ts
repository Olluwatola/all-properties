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

  @ManyToOne(() => Property, { nullable: false, onDelete: 'CASCADE' })
  property: Property;

  @Column({ type: 'enum', enum: BaseUnit })
  base_unit: BaseUnit; // "day" | "week" | "month" | "year"

  @Column({ type: 'int' })
  amount_of_unit: number; // Example: 1 day, 7 days, etc.

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; // Price for the selected unit

  @ManyToOne(() => Currency, { nullable: false, onDelete: 'CASCADE' })
  currency: Currency;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
