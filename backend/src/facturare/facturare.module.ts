import { Module } from '@nestjs/common';
import { FacturareService } from './facturare.service';
import { FacturareController } from './facturare.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Verifică calea dacă diferă
import { NotificariModule } from '../notificari/notificari.module';

@Module({
  imports: [PrismaModule, NotificariModule],
  controllers: [FacturareController],
  providers: [FacturareService],
})
export class FacturareModule {}
