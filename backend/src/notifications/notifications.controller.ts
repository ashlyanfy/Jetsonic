import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PushService } from './push.service';

interface SubscribeBody {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

interface UnsubscribeBody {
  endpoint: string;
}

@Controller('push')
export class NotificationsController {
  constructor(private readonly push: PushService) {}

  @Get('public-key')
  @UseGuards(JwtAuthGuard)
  publicKey() {
    return { publicKey: this.push.getPublicKey(), enabled: this.push.isConfigured() };
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  subscribe(@Body() body: SubscribeBody, @CurrentUser() user: AuthUser) {
    return this.push.subscribe(
      { endpoint: body.endpoint, p256dh: body.keys.p256dh, auth: body.keys.auth },
      user.id,
    );
  }

  @Delete('subscribe')
  @UseGuards(JwtAuthGuard)
  unsubscribe(@Body() body: UnsubscribeBody) {
    return this.push.unsubscribe(body.endpoint);
  }

  @Post('test')
  @UseGuards(JwtAuthGuard)
  test(@CurrentUser() user: AuthUser) {
    return this.push.sendTest(user.id);
  }
}
