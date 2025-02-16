import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SignupPayloadDto } from './dtos/SignupPayloadDto';
//import { LoginPayloadDto } from './dtos/LoginPayloadDto';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { LocalGuard } from './local/local.guard';
import { UserService } from './../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('register')
  async register(@Body() signupPayload: SignupPayloadDto) {
    const user = await this.userService.findUserByEmail(signupPayload.email);
    if (user) {
      throw new ForbiddenException('an account with that email exists already');
    }
    const createdUser = await this.userService.createUser(signupPayload);

    const { password, role, kycDocument, deletedAt, id, ...returnableUser } =
      createdUser;
    return returnableUser;
  }

  @Post('login')
  @UseGuards(LocalGuard)
  login(@Req() req: Request) {
    return req.user;
  }
}
