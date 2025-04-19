import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './../user/user.module';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordResetToken } from './../typeorm/entities/PasswordResetToken';
import { MailerModule } from '@nestjs-modules/mailer';
import { LoginValidationMiddlewareMiddleware } from './middlewares/login-validation-middleware/login-validation-middleware.middleware';

@Module({
  imports: [
    ConfigModule.forRoot(), // Load environment variables
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION') },
      }),
    }),
    UserModule,
    PassportModule,
    TypeOrmModule.forFeature([PasswordResetToken]),
    MailerModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoginValidationMiddlewareMiddleware)
      .forRoutes({ path: 'auth/login', method: RequestMethod.POST });
  }
}
