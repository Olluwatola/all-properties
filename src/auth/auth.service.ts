import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {} from './dtos/SignupPayloadDto';
import * as bcrypt from 'bcryptjs';
import { LoginPayloadDto } from './dtos/LoginPayloadDto';
import { UserService } from './../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordResetToken } from './../typeorm/entities/PasswordResetToken';
import { Repository } from 'typeorm';
import { User } from './../typeorm/entities/User';
import { MailerService } from '@nestjs-modules/mailer';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    @InjectRepository(PasswordResetToken)
    private readonly tokenRepo: Repository<PasswordResetToken>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly mailerService: MailerService,
  ) {}

  async validateUser(loginPayloadDto: LoginPayloadDto): Promise<string | null> {
    const { email, password } = loginPayloadDto;

    const findUser = await this.userService.findUserByEmail(email);
    console.log(findUser);
    if (!findUser) return null;

    const isPasswordValid: boolean = await bcrypt.compare(
      password,
      findUser.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.jwtService.sign({ id: findUser.id });
  }

  async generateResetToken(email: string): Promise<void> {
    const user = await this.userRepo.findOneBy({ email });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate a random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
    const createdAt = new Date();

    // Save the token in the database
    const resetToken = this.tokenRepo.create({
      token,
      expiresAt,
      user,
      createdAt,
    });
    await this.tokenRepo.save(resetToken);

    // Send the token via email
    // await this.mailerService.sendMail({
    //   to: email,
    //   subject: 'Password Reset',
    //   text: `Click the link to reset your password: http://yourapp.com/reset-password?token=${token}`,
    // });

    console.log(token);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetToken = await this.tokenRepo.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new Error('Invalid or expired token');
    }

    // Update the user's password
    const user = resetToken.user;
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepo.save(user);

    // Delete the token
    await this.tokenRepo.delete(resetToken.id);
  }
}
