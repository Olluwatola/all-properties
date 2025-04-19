import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PassportModule } from '@nestjs/passport';
import { User } from './typeorm/entities/User';
import { MailerConfigModule } from './mailer/mailer.module';
import { PasswordResetToken } from './typeorm/entities/PasswordResetToken';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { Media } from './typeorm/entities/Media';
import { MediaModule } from './media/media.module';
import { PropertyModule } from './property/property.module';
import { PopulateDataModule } from './populate-data/populate-data.module';
import { Property } from './typeorm/entities/Property';
import { State } from './typeorm/entities/State';
import { LGA } from './typeorm/entities/LGA';
import { Booking } from './typeorm/entities/Booking';
import { Currency } from './typeorm/entities/Currency';
import { PromoCode } from './typeorm/entities/PromoCode';
import { PropertyBooked } from './typeorm/entities/PropertyBooked';
import { PropertyPricing } from './typeorm/entities/PropertyPricing';
import { CurrencyModule } from './currency/currency.module';
import { BookingModule } from './booking/booking.module';
import { PaymentModule } from './payment/payment.module';
import { Payment } from './typeorm/entities/Payment';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes environment variables available globally
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<'postgres'>('DATABASE_TYPE'),
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [
          User,
          PasswordResetToken,
          Media,
          Property,
          State,
          LGA,
          Booking,
          Currency,
          PromoCode,
          PropertyBooked,
          PropertyPricing,
          Payment,
        ],
        synchronize: true,
      }),
    }),
    AuthModule,
    PassportModule,
    UserModule,
    MailerConfigModule,
    CloudinaryModule,
    MediaModule,
    PropertyModule,
    PopulateDataModule,
    CurrencyModule,
    BookingModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
