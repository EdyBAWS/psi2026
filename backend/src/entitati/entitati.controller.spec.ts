import { Test, TestingModule } from '@nestjs/testing';
import { EntitatiController } from './entitati.controller';
import { EntitatiService } from './entitati.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EntitatiController', () => {
  let controller: EntitatiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntitatiController],
      providers: [
        EntitatiService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<EntitatiController>(EntitatiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
