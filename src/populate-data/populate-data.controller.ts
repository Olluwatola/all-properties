import { Controller, Post } from '@nestjs/common';
import { PopulateDataService } from './populate-data.service';

@Controller('populate')
export class PopulateDataController {
  constructor(private readonly populateDataService: PopulateDataService) {}

  @Post('states')
  async populate() {
    return this.populateDataService.populateData();
  }
}
