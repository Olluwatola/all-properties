import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Property } from './Property';
import { User } from './User';
import { PropertyPricing } from './PropertyPricing';
import { PromoCode } from './PromoCode';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Property, { nullable: false, onDelete: 'CASCADE' })
  property: Property;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  renter: User;

  @ManyToOne(() => PropertyPricing, { nullable: false, onDelete: 'CASCADE' })
  property_pricing: PropertyPricing;

  @Column({ type: 'int' })
  amount_of_purchase: number; // Number of time units (e.g., 3 days)

  @Column({ type: 'date' })
  start_date: string;

  @Column({ type: 'date' })
  end_date: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_cost: number; // Cost before discount

  @ManyToOne(() => PromoCode, { nullable: true, onDelete: 'SET NULL' })
  promo_applied?: PromoCode;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  payable_total: number; // Final amount after applying promo

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  payment_status: PaymentStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
