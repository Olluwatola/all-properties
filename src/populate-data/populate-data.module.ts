import { Module } from '@nestjs/common';
import { PopulateDataService } from './populate-data.service';
import { PopulateDataController } from './populate-data.controller';
import { PropertyModule } from './../property/property.module';

@Module({
  imports: [PropertyModule],
  providers: [PopulateDataService],
  controllers: [PopulateDataController],
})
export class PopulateDataModule {}
