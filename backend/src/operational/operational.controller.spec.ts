import { Test, TestingModule } from '@nestjs/testing';
import { OperationalController } from './operational.controller';
import { OperationalService } from './operational.service';

describe('OperationalController', () => {
  let controller: OperationalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OperationalController],
      providers: [
        {
          provide: OperationalService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<OperationalController>(OperationalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
