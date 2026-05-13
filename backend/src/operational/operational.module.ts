import { Module } from '@nestjs/common';
import { OperationalController } from './operational.controller';
import { OperationalService } from './operational.service';
import { PrismaModule } from '../prisma/prisma.module'; // Verifică să fie calea corectă
import { NotificariModule } from '../notificari/notificari.module';

@Module({
  imports: [PrismaModule, NotificariModule],
  controllers: [OperationalController],
  providers: [OperationalService],
})
export class OperationalModule {}
