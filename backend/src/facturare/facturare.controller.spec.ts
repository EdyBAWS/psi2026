import { Test, TestingModule } from '@nestjs/testing';
import { FacturareController } from './facturare.controller';
import { FacturareService } from './facturare.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FacturareController', () => {
  let controller: FacturareController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacturareController],
      providers: [
        FacturareService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<FacturareController>(FacturareController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
