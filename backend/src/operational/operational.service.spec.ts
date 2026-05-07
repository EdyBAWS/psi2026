import { Test, TestingModule } from '@nestjs/testing';
import { OperationalService } from './operational.service';
import { beforeEach, describe, it } from 'node:test';

describe('OperationalService', () => {
  let service: OperationalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OperationalService],
    }).compile();

    service = module.get<OperationalService>(OperationalService);
  });

});


