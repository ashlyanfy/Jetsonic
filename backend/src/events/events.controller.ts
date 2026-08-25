import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Ip,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EventRangeDto, ListEventsDto } from './dto/list-events.dto';
import { TrackEventDto } from './dto/track-event.dto';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  // ----- Public: visitor action ingest from the landing site -----
  // Higher limit than the global 30/min: one page visit legitimately produces
  // a PAGE_VIEW plus several action events, and an office NAT shares one IP.
  @Post('track')
  @HttpCode(202)
  @Throttle({ default: { limit: 120, ttl: 60_000 } })
  async track(
    @Body() dto: TrackEventDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    await this.events.track(dto, { ip, userAgent });
    return { ok: true };
  }

  // ----- Admin endpoints (require JWT) -----
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  stats(@Query() query: EventRangeDto) {
    return this.events.stats(query.from, query.to);
  }

  @Get('daily')
  @UseGuards(JwtAuthGuard)
  daily(@Query() query: EventRangeDto) {
    return this.events.daily(query.from, query.to);
  }

  @Get('by-page')
  @UseGuards(JwtAuthGuard)
  byPage(@Query() query: EventRangeDto) {
    return this.events.byPage(query.from, query.to);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  list(@Query() query: ListEventsDto) {
    return this.events.findMany(query);
  }
}
