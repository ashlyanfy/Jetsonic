import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscribeDto, UnsubscribeDto } from './dto/subscribe.dto';
import { PushService } from './push.service';

@Controller('push')
export class NotificationsController {
  constructor(private readonly push: PushService) {}

  // VAPID public key is intentionally public — required by browser to subscribe.
  @Get('public-key')
  publicKey() {
    return { publicKey: this.push.getPublicKey(), enabled: this.push.isConfigured() };
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  subscribe(@Body() body: SubscribeDto, @CurrentUser() user: AuthUser) {
    return this.push.subscribe(
      { endpoint: body.endpoint, p256dh: body.keys.p256dh, auth: body.keys.auth },
      user.id,
    );
  }

  @Delete('subscribe')
  @UseGuards(JwtAuthGuard)
  unsubscribe(@Body() body: UnsubscribeDto) {
    return this.push.unsubscribe(body.endpoint);
  }

  @Post('test')
  @UseGuards(JwtAuthGuard)
  test(@CurrentUser() user: AuthUser) {
    return this.push.sendTest(user.id);
  }
}
