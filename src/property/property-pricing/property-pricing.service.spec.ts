import { Test, TestingModule } from '@nestjs/testing';
import { PropertyPricingService } from './property-pricing.service';

describe('PropertyPricingService', () => {
  let service: PropertyPricingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PropertyPricingService],
    }).compile();

    service = module.get<PropertyPricingService>(PropertyPricingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
