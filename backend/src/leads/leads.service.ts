import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Lead, LeadStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PushService } from '../notifications/push.service';
import { TelegramService } from '../notifications/telegram.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ListLeadsDto } from './dto/list-leads.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

interface CreateLeadContext {
  ip?: string;
  userAgent?: string;
  attachmentUrl?: string;
}

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushService,
    private readonly telegram: TelegramService,
  ) {}

  async create(dto: CreateLeadDto, ctx: CreateLeadContext): Promise<Lead> {
    const lead = await this.prisma.lead.create({
      data: {
        name: dto.name,
        email: dto.email,
        company: dto.company,
        role: dto.role,
        phone: dto.phone,
        requestType: dto.requestType,
        urgency: dto.urgency,
        partNumber: dto.partNumber,
        altPartNumber: dto.altPartNumber,
        ataChapter: dto.ataChapter,
        aircraftType: dto.aircraftType,
        tailNumber: dto.tailNumber,
        quantity: dto.quantity,
        condition: dto.condition,
        certificate: dto.certificate,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : null,
        deliveryLocation: dto.deliveryLocation,
        message: dto.message,
        source: dto.source,
        ip: ctx.ip,
        userAgent: ctx.userAgent,
        attachmentUrl: ctx.attachmentUrl,
      },
    });
    this.logger.log(`Lead created #${lead.id} from ${lead.email}`);

    // Fire-and-forget notifications — do not block the response.
    this.telegram.sendNewLead(lead).catch((e) => this.logger.warn(`Telegram: ${e.message}`));
    this.push.notifyNewLead(lead).catch((e) => this.logger.warn(`Push: ${e.message}`));

    return lead;
  }

  async findMany(query: ListLeadsDto) {
    const where: Prisma.LeadWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.urgency) where.urgency = query.urgency;
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }
    if (query.q) {
      const q = query.q.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { partNumber: { contains: q, mode: 'insensitive' } },
      ];
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { assignee: { select: { id: true, name: true, email: true, role: true } } },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return { items, total, page, pageSize, pages: Math.ceil(total / pageSize) };
  }

  async findOne(id: number) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        notes: {
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { id: true, name: true, email: true } } },
        },
        assignee: { select: { id: true, name: true, email: true, role: true } },
      },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async update(id: number, dto: UpdateLeadDto, actingUserId?: string) {
    const existing = await this.findOne(id);
    const data: { status?: LeadStatus; assigneeId?: string | null } = {};
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.assigneeId !== undefined) data.assigneeId = dto.assigneeId === '' ? null : dto.assigneeId;

    // Auto-assign the acting user when status changes and lead has no assignee yet
    // and the request did not explicitly pass an assigneeId.
    if (
      dto.status !== undefined &&
      dto.assigneeId === undefined &&
      !existing.assigneeId &&
      actingUserId
    ) {
      data.assigneeId = actingUserId;
    }

    return this.prisma.lead.update({
      where: { id },
      data,
      include: { assignee: { select: { id: true, name: true, email: true, role: true } } },
    });
  }

  async addNote(leadId: number, authorId: string, body: string) {
    await this.findOne(leadId);
    return this.prisma.leadNote.create({
      data: { leadId, authorId, body },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.lead.delete({ where: { id } });
    return { ok: true };
  }

  async findManyForExport(query: ListLeadsDto) {
    const where: Prisma.LeadWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.urgency) where.urgency = query.urgency;
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }
    if (query.q) {
      const q = query.q.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { partNumber: { contains: q, mode: 'insensitive' } },
      ];
    }
    return this.prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async stats() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [total, newCount, inProgress, planned, rejected, converted, aog, last7] =
      await this.prisma.$transaction([
        this.prisma.lead.count(),
        this.prisma.lead.count({ where: { status: 'NEW' } }),
        this.prisma.lead.count({ where: { status: 'IN_PROGRESS' } }),
        this.prisma.lead.count({ where: { status: 'PLANNED' } }),
        this.prisma.lead.count({ where: { status: 'REJECTED' } }),
        this.prisma.lead.count({ where: { status: 'CONVERTED' } }),
        this.prisma.lead.count({ where: { urgency: 'AOG' } }),
        this.prisma.lead.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      ]);

    return {
      total,
      byStatus: {
        NEW: newCount,
        IN_PROGRESS: inProgress,
        PLANNED: planned,
        REJECTED: rejected,
        CONVERTED: converted,
      },
      aog,
      last7,
    };
  }

  async daily(days: number, status?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - (days - 1));

    const where: Prisma.LeadWhereInput = { createdAt: { gte: start } };
    if (status && ['NEW', 'IN_PROGRESS', 'PLANNED', 'REJECTED', 'CONVERTED'].includes(status)) {
      where.status = status as LeadStatus;
    }

    const leads = await this.prisma.lead.findMany({
      where,
      select: { createdAt: true },
    });

    const buckets: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      buckets[d.toISOString().slice(0, 10)] = 0;
    }

    for (const lead of leads) {
      const key = lead.createdAt.toISOString().slice(0, 10);
      if (key in buckets) buckets[key] += 1;
    }

    return Object.entries(buckets).map(([date, count]) => ({ date, count }));
  }
}
