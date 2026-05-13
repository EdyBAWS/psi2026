import { Global, Module } from '@nestjs/common';
import { NotificariController } from './notificari.controller';
import { NotificariService } from './notificari.service';

@Global()
@Module({
  controllers: [NotificariController],
  providers: [NotificariService],
  exports: [NotificariService],
})
export class NotificariModule {}
