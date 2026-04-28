import { Module } from '@nestjs/common';
import { EntitatiService } from './entitati.service';
import { EntitatiController } from './entitati.controller';

@Module({
  controllers: [EntitatiController],
  providers: [EntitatiService],
})
export class EntitatiModule {}
