import { Test, TestingModule } from '@nestjs/testing';
import { OperationalController } from './operational.controller';

describe('OperationalController', () => {
  let controller: OperationalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OperationalController],
    }).compile();

    controller = module.get<OperationalController>(OperationalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
