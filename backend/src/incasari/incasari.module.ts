import { Module } from '@nestjs/common';
import { NotificariModule } from '../notificari/notificari.module';
import { IncasariController } from './incasari.controller';
import { IncasariService } from './incasari.service';

@Module({
  imports: [NotificariModule],
  controllers: [IncasariController],
  providers: [IncasariService],
})
export class IncasariModule {}
