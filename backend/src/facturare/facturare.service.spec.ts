import { Test, TestingModule } from '@nestjs/testing';
import { FacturareService } from './facturare.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificariService } from '../notificari/notificari.service';

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
        {
          provide: NotificariService,
          useValue: { create: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<FacturareService>(FacturareService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
