import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity()
export class Currency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  short_code: string; // Example: "USD", "NGN"

  @Column()
  name: string; // Example: "US Dollar", "Naira"

  @Column({ type: 'timestamp', nullable: true })
  inactive_at?: Date | null;

  @Column({ type: 'int' })
  decimals: number; // Decimal places (e.g., 2 for "10.50 USD")

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  author: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;
}
