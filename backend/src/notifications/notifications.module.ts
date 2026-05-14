import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { PushService } from './push.service';
import { TelegramService } from './telegram.service';

@Module({
  controllers: [NotificationsController],
  providers: [PushService, TelegramService],
  exports: [PushService, TelegramService],
})
export class NotificationsModule {}
