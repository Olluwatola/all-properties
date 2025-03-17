import { Test, TestingModule } from '@nestjs/testing';
import { PopulateDataController } from './populate-data.controller';

describe('PopulateDataController', () => {
  let controller: PopulateDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PopulateDataController],
    }).compile();

    controller = module.get<PopulateDataController>(PopulateDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
