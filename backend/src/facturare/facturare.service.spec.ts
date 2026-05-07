import { Test, TestingModule } from '@nestjs/testing';
import { FacturareService } from './facturare.service';

describe('FacturareService', () => {
  let service: FacturareService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacturareService],
    }).compile();

    service = module.get<FacturareService>(FacturareService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
