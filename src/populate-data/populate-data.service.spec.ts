import { Test, TestingModule } from '@nestjs/testing';
import { PopulateDataService } from './populate-data.service';

describe('PopulateDataService', () => {
  let service: PopulateDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PopulateDataService],
    }).compile();

    service = module.get<PopulateDataService>(PopulateDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
