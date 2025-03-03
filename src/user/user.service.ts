import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignupPayloadDto } from './../auth/dtos/SignupPayloadDto';
import { KYCStatus, User, UserRole } from './../typeorm/entities/User';
import { Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async createUser(signupPayload: SignupPayloadDto) {
    const createdUser = this.userRepo.create({
      ...signupPayload,
      password: await bcryptjs.hash(signupPayload.password, 10),
      role: UserRole.REGULAR,
      kycStatus: KYCStatus.NOTAPPLIED,
      createdAt: new Date(),
    });

    return await this.userRepo.save(createdUser);
  }

  async findUserByEmail(email: string) {
    return await this.userRepo.findOneBy({ email });
  }
}
