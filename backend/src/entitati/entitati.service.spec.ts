import { Test, TestingModule } from '@nestjs/testing';
import { EntitatiService } from './entitati.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EntitatiService', () => {
  let service: EntitatiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntitatiService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<EntitatiService>(EntitatiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
