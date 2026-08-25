import { Injectable } from '@nestjs/common';
import { Prisma, SiteEvent, SiteEventType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListEventsDto } from './dto/list-events.dto';
import { TrackEventDto } from './dto/track-event.dto';

interface TrackContext {
  ip?: string;
  userAgent?: string;
}

/** Per-type counters used by stats and the by-page breakdown. */
type TypeCounts = Record<SiteEventType, number>;

const EVENT_TYPES = Object.values(SiteEventType);

function emptyCounts(): TypeCounts {
  return Object.fromEntries(EVENT_TYPES.map((t) => [t, 0])) as TypeCounts;
}

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Inclusive [from, to] range as UTC day boundaries.
   * Both dates default to today so the dashboard opens on "today" cheaply.
   */
  private range(from?: string, to?: string): { start: Date; end: Date } {
    const today = new Date().toISOString().slice(0, 10);
    const start = new Date(`${from || today}T00:00:00.000Z`);
    const end = new Date(`${to || today}T23:59:59.999Z`);
    return { start, end };
  }

  private rangeWhere(from?: string, to?: string): Prisma.SiteEventWhereInput {
    const { start, end } = this.range(from, to);
    return { createdAt: { gte: start, lte: end } };
  }

  async track(dto: TrackEventDto, ctx: TrackContext): Promise<SiteEvent> {
    return this.prisma.siteEvent.create({
      data: {
        type: dto.type,
        page: dto.page,
        visitorId: dto.visitorId,
        ip: ctx.ip,
        userAgent: ctx.userAgent?.slice(0, 500),
      },
    });
  }

  /** Per-type totals + unique visitors for the period. */
  async stats(from?: string, to?: string) {
    const where = this.rangeWhere(from, to);

    const [byType, uniqueVisitors] = await Promise.all([
      this.prisma.siteEvent.groupBy({
        by: ['type'],
        where,
        _count: { _all: true },
      }),
      this.prisma.siteEvent
        .groupBy({ by: ['visitorId'], where })
        .then((rows) => rows.length),
    ]);

    const counts = emptyCounts();
    for (const row of byType) counts[row.type] = row._count._all;

    const actions =
      counts.WHATSAPP +
      counts.CALL +
      counts.EMAIL +
      counts.FORM_START +
      counts.RFQ_SUBMIT;

    return {
      pageViews: counts.PAGE_VIEW,
      whatsapp: counts.WHATSAPP,
      call: counts.CALL,
      email: counts.EMAIL,
      formStart: counts.FORM_START,
      rfqSubmit: counts.RFQ_SUBMIT,
      uniqueVisitors,
      actions,
      total: counts.PAGE_VIEW + actions,
    };
  }

  /** Daily activity for the chart: views, actions and unique visitors per day. */
  async daily(from?: string, to?: string) {
    const { start, end } = this.range(from, to);

    // Hard cap so a mistyped range cannot make the API walk years of rows.
    const dayMs = 24 * 60 * 60 * 1000;
    const days = Math.min(
      366,
      Math.max(1, Math.round((end.getTime() - start.getTime()) / dayMs)),
    );

    const events = await this.prisma.siteEvent.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { type: true, visitorId: true, createdAt: true },
    });

    const buckets = new Map<
      string,
      { views: number; actions: number; visitors: Set<string> }
    >();
    for (let i = 0; i < days; i++) {
      const key = new Date(start.getTime() + i * dayMs)
        .toISOString()
        .slice(0, 10);
      buckets.set(key, { views: 0, actions: 0, visitors: new Set() });
    }

    for (const event of events) {
      const bucket = buckets.get(event.createdAt.toISOString().slice(0, 10));
      if (!bucket) continue;
      if (event.type === 'PAGE_VIEW') bucket.views += 1;
      else bucket.actions += 1;
      bucket.visitors.add(event.visitorId);
    }

    return Array.from(buckets.entries()).map(([date, b]) => ({
      date,
      views: b.views,
      actions: b.actions,
      visitors: b.visitors.size,
    }));
  }

  /** Which pages drive contacts — per-page breakdown sorted by total actions. */
  async byPage(from?: string, to?: string) {
    const rows = await this.prisma.siteEvent.groupBy({
      by: ['page', 'type'],
      where: this.rangeWhere(from, to),
      _count: { _all: true },
    });

    const pages = new Map<string, TypeCounts>();
    for (const row of rows) {
      const key = row.page || '—';
      const counts = pages.get(key) ?? emptyCounts();
      counts[row.type] += row._count._all;
      pages.set(key, counts);
    }

    const items = Array.from(pages.entries()).map(([page, c]) => ({
      page,
      pageViews: c.PAGE_VIEW,
      whatsapp: c.WHATSAPP,
      call: c.CALL,
      email: c.EMAIL,
      formStart: c.FORM_START,
      rfqSubmit: c.RFQ_SUBMIT,
      total: c.WHATSAPP + c.CALL + c.EMAIL + c.FORM_START + c.RFQ_SUBMIT,
    }));

    // Pages that convert first, then by traffic.
    items.sort((a, b) => b.total - a.total || b.pageViews - a.pageViews);
    return { items };
  }

  /** Paginated action journal with filters. */
  async findMany(query: ListEventsDto) {
    const where: Prisma.SiteEventWhereInput = this.rangeWhere(
      query.from,
      query.to,
    );
    if (query.type) where.type = query.type;
    if (query.page_name) where.page = query.page_name;

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.siteEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          type: true,
          page: true,
          visitorId: true,
          createdAt: true,
        },
      }),
      this.prisma.siteEvent.count({ where }),
    ]);

    return { items, total, page, pageSize, pages: Math.ceil(total / pageSize) };
  }
}
