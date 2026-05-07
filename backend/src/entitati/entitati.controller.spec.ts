import { Test, TestingModule } from '@nestjs/testing';
import { EntitatiController } from './entitati.controller';
import { EntitatiService } from './entitati.service';
import { beforeEach, describe, it } from 'node:test';

describe('EntitatiController', () => {
  let controller: EntitatiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntitatiController],
      providers: [EntitatiService],
    }).compile();

    controller = module.get<EntitatiController>(EntitatiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
function expect(controller: EntitatiController) {
  throw new Error('Function not implemented.');
}

