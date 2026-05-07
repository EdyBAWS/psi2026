import { Test, TestingModule } from '@nestjs/testing';
import { FacturareController } from './facturare.controller';
import { FacturareService } from './facturare.service';

describe('FacturareController', () => {
  let controller: FacturareController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacturareController],
      providers: [FacturareService],
    }).compile();

    controller = module.get<FacturareController>(FacturareController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
