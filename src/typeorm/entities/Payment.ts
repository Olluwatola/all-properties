import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Booking } from './Booking';
import { PromoCode } from './PromoCode';
import { PropertyPricing } from './PropertyPricing';
import { Currency } from './Currency';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentProvider {
  PAYSTACK = 'paystack',
  STRIPE = 'stripe',
}

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Booking, { nullable: false, onDelete: 'NO ACTION' })
  booking: Booking;

  @ManyToOne(() => User, { nullable: false, onDelete: 'NO ACTION' })
  user: User;

  @Column({ type: 'int' })
  amount_purchased: number;

  @Column({ type: 'int' })
  individual_cost: number;

  @Column({ type: 'int' })
  subtotal: number;

  @Column({ type: 'int' })
  payable_total: number;

  @ManyToOne(() => PromoCode, { nullable: true, onDelete: 'SET NULL' })
  promocode_applied: PromoCode;

  @ManyToOne(() => PropertyPricing, { nullable: false, onDelete: 'CASCADE' })
  propertyPricing: PropertyPricing;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'varchar', unique: true })
  tx_ref: string;

  @Column({ type: 'enum', enum: PaymentProvider })
  provider: PaymentProvider;

  @ManyToOne(() => Currency, { nullable: false, onDelete: 'RESTRICT' })
  currency: Currency;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
