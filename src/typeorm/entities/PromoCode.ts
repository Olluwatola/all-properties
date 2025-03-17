import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Property } from './Property';

export enum PromoType {
  PROPERTY = 'property',
  LISTER = 'lister',
  GLOBAL = 'global',
}

@Entity()
export class PromoCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  percentage_off: number; // Discount percentage (e.g., 15.5 for 15.5%)

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  lister?: User; // Optional, if type = "lister"

  @ManyToOne(() => Property, { nullable: true, onDelete: 'SET NULL' })
  property?: Property; // Optional, if type = "property"

  @Column({ type: 'enum', enum: PromoType })
  type: PromoType; // "property" | "lister" | "global"

  @Column({ type: 'timestamp', nullable: true })
  inactive_at?: Date; // If promo is expired

  @Column({ type: 'int' })
  no_of_use: number; // Total times it can be used

  @Column({ type: 'int' })
  amount_of_use_left: number; // Remaining uses

  @Column({ nullable: true })
  provider?: string; // Example: "paystack"

  @Column({ nullable: true })
  provider_coupon_id?: string; // External promo ID

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
