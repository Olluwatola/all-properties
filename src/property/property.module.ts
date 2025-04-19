import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './../typeorm/entities/Property';
import { LGA } from './../typeorm/entities/LGA';
import { State } from './../typeorm/entities/State';
import { MediaModule } from './../media/media.module';
import { PropertyBooked } from './../typeorm/entities/PropertyBooked';
//import { UploadMiddleware } from './property.middleware';
import { PropertyPricingService } from './property-pricing/property-pricing.service';
import { PropertyPricing } from './../typeorm/entities/PropertyPricing';
import { CurrencyModule } from 'src/currency/currency.module';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Property,
      LGA,
      State,
      PropertyBooked,
      PropertyPricing,
    ]),
    MediaModule,
    CurrencyModule,
    PaymentModule,
  ],
  controllers: [PropertyController],
  providers: [PropertyService, PropertyPricingService],
  exports: [PropertyService],
})
export class PropertyModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(UploadMiddleware).forRoutes(PropertyController);
  // }
}
