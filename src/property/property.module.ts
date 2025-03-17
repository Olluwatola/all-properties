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

@Module({
  imports: [
    TypeOrmModule.forFeature([Property, LGA, State, PropertyBooked]),
    MediaModule,
  ],
  controllers: [PropertyController],
  providers: [PropertyService],
  exports: [PropertyService],
})
export class PropertyModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(UploadMiddleware).forRoutes(PropertyController);
  // }
}
