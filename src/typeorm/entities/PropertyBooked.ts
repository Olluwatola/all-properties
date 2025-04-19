import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Property } from './Property';
import { Booking } from './Booking';

@Entity()
export class PropertyBooked {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Property, { nullable: false, onDelete: 'CASCADE' })
  property: Property;

  @ManyToOne(() => Booking, { nullable: false, onDelete: 'CASCADE' })
  booking: Booking;

  @Column({ type: 'date' })
  startDate: Date; // YYYY-MM-DD format

  @Column({ type: 'date' })
  endDate: Date; // YYYY-MM-DD format

  @CreateDateColumn()
  created_at: Date;
}
