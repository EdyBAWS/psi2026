import { Test, TestingModule } from '@nestjs/testing';
import { EntitatiService } from './entitati.service';

describe('EntitatiService', () => {
  let service: EntitatiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntitatiService],
    }).compile();

    service = module.get<EntitatiService>(EntitatiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
