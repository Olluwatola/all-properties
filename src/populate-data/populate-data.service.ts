import { Injectable } from '@nestjs/common';
import { PropertyService } from './../property/property.service';
import * as fs from 'fs';

@Injectable()
export class PopulateDataService {
  constructor(private readonly propertyService: PropertyService) {}

  async populateData() {
    const rawData = fs.readFileSync(
      './src/populate-data/json-data/nigeria-state-and-lgas.json',
      'utf-8',
    );
    const data = JSON.parse(rawData);

    for (const item of data) {
      // Create State
      const state = await this.propertyService.createStates([
        { name: item.state, alias: item.alias },
      ]);

      // Create LGAs under the state
      await this.propertyService.createLGAs(state[0].id, item.lgas);
    }

    console.log('Database populated successfully!');
  }
}
