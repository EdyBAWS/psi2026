import { Test, TestingModule } from '@nestjs/testing';
import { FacturareService } from './facturare.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FacturareService', () => {
  let service: FacturareService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturareService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<FacturareService>(FacturareService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
