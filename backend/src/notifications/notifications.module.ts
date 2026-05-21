import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { PushService } from './push.service';
import { TelegramService } from './telegram.service';
import { EmailService } from './email.service';

@Module({
  controllers: [NotificationsController],
  providers: [PushService, TelegramService, EmailService],
  exports: [PushService, TelegramService, EmailService],
})
export class NotificationsModule {}
