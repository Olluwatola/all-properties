import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { PasswordResetToken } from './PasswordResetToken';

export enum UserRole {
  REGULAR = 'regular',
  ADMIN = 'admin',
}

export enum KYCStatus {
  NOTAPPLIED = 'not-applied',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phoneNo: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.REGULAR })
  role: UserRole;

  @Column({ type: 'enum', enum: KYCStatus, default: KYCStatus.NOTAPPLIED })
  kycStatus: KYCStatus;

  @Column({ nullable: true })
  kycDocument: string;

  @Column({ nullable: true })
  profilePicture: string;

  @OneToMany(() => PasswordResetToken, (token) => token.user)
  passwordResetTokens: PasswordResetToken[];

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
