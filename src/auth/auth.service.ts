import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {} from './dtos/SignupPayloadDto';
import * as bcrypt from 'bcryptjs';
import { LoginPayloadDto } from './dtos/LoginPayloadDto';
import { UserService } from './../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
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
}
