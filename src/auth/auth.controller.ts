import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SignupPayloadDto } from './dtos/SignupPayloadDto';
import { ForgotPasswordPayloadDto } from './dtos/ForgotPasswordPayloadDto';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { LocalGuard } from './local/local.guard';
import { UserService } from './../user/user.service';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

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

  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordPayload: ForgotPasswordPayloadDto,
  ) {
    await this.authService.generateResetToken(forgotPasswordPayload.email);
    return { message: 'Password reset email sent' };
  }

  @Post('reset-password')
  async resetPassword(
    @Query('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    // if(!token){
    //   return new  ExceptionsHandler(un)
    // }
    await this.authService.resetPassword(token, newPassword);
    return { message: 'Password reset successfully' };
  }
}
