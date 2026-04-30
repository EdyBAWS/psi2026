import { Module } from '@nestjs/common';
import { FacturareService } from './facturare.service';
import { FacturareController } from './facturare.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Verifică calea dacă diferă

@Module({
  imports: [PrismaModule],
  controllers: [FacturareController],
  providers: [FacturareService],
})
export class FacturareModule {}