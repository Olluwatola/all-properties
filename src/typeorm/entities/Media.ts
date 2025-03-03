// src/typeorm/entities/Media.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity()
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['public', 'private'], default: 'public' })
  privacy_type: 'public' | 'private';

  @ManyToOne(() => User, { nullable: true })
  sender: User;

  @Column({ type: 'enum', enum: ['app', 'user', 'dispute'], nullable: true })
  recipient_type: 'app' | 'user' | 'dispute';

  @Column({ nullable: true })
  recipient_user_id: string; // Foreign key to User entity

  @Column({ nullable: true })
  recipient_dispute_id: string; // Foreign key to Dispute entity (if applicable)

  @Column({ nullable: true })
  description: string;

  @Column()
  public_id: string; // Cloudinary public ID

  @Column()
  file_url: string; // Cloudinary file URL

  @Column({ type: 'enum', enum: ['image', 'video'] })
  file_type: 'image' | 'video';

  @Column()
  file_size: number; // File size in bytes

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
