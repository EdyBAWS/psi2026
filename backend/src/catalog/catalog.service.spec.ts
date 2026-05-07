import { Test, TestingModule } from '@nestjs/testing';
import { CatalogService } from './catalog.service';
import { beforeEach, describe, it } from 'node:test';

describe('CatalogService', () => {
  let service: CatalogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatalogService],
    }).compile();

    service = module.get<CatalogService>(CatalogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
function expect(value: any) {
  return {
    toBeDefined: () => {
      if (value === undefined) {
        throw new Error('Expected value to be defined');
      }
    }
  };
}

