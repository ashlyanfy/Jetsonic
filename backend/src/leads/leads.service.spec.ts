import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../notifications/telegram.service';
import { EmailService } from '../notifications/email.service';
import { PushService } from '../notifications/push.service';
import type { Lead } from '@prisma/client';

const mockLead: Lead = {
  id: 1,
  name: 'Ahmed Al-Rashidi',
  email: 'ahmed@airline.com',
  company: 'Gulf Air',
  role: 'Procurement',
  phone: '+971501234567',
  requestType: 'RFQ',
  urgency: 'Priority',
  partNumber: '65-45631-7',
  altPartNumber: null,
  ataChapter: '32-40',
  aircraftType: 'Boeing 737-800',
  tailNumber: 'A9C-FA',
  quantity: '2',
  condition: 'Serviceable',
  certificate: 'EASA Form 1',
  targetDate: new Date('2026-06-01'),
  deliveryLocation: 'Bahrain International Airport',
  message: 'Urgent need',
  attachmentUrl: null,
  source: '/contact/',
  ip: '1.2.3.4',
  userAgent: 'Mozilla/5.0',
  status: 'NEW',
  assigneeId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('LeadsService', () => {
  let service: LeadsService;
  let prisma: { lead: jest.Mocked<Record<string, jest.Mock>> };
  let telegram: jest.Mocked<TelegramService>;
  let email: jest.Mocked<EmailService>;
  let push: jest.Mocked<PushService>;

  beforeEach(async () => {
    prisma = {
      lead: {
        create: jest.fn().mockResolvedValue(mockLead),
        findMany: jest.fn().mockResolvedValue([mockLead]),
        count: jest.fn().mockResolvedValue(1),
        findUnique: jest.fn().mockResolvedValue(mockLead),
        update: jest.fn().mockResolvedValue(mockLead),
        delete: jest.fn().mockResolvedValue(mockLead),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        { provide: PrismaService, useValue: { ...prisma, $transaction: jest.fn().mockImplementation((fns: Promise<unknown>[]) => Promise.all(fns)) } },
        { provide: TelegramService, useValue: { sendNewLead: jest.fn().mockResolvedValue(undefined) } },
        { provide: EmailService, useValue: { sendNewLead: jest.fn().mockResolvedValue(undefined) } },
        { provide: PushService, useValue: { notifyNewLead: jest.fn().mockResolvedValue(undefined) } },
      ],
    }).compile();

    service = module.get(LeadsService);
    telegram = module.get(TelegramService) as jest.Mocked<TelegramService>;
    email = module.get(EmailService) as jest.Mocked<EmailService>;
    push = module.get(PushService) as jest.Mocked<PushService>;
  });

  describe('create', () => {
    const dto = {
      name: 'Ahmed Al-Rashidi',
      email: 'ahmed@airline.com',
      requestType: 'RFQ',
      urgency: 'Priority',
    };

    it('creates a lead and returns it', async () => {
      const result = await service.create(dto as any, { ip: '1.2.3.4' });
      expect(result).toEqual(mockLead);
      expect(prisma.lead.create).toHaveBeenCalledTimes(1);
    });

    it('fires telegram notification after create', async () => {
      await service.create(dto as any, {});
      // Fire-and-forget — wait one tick
      await Promise.resolve();
      expect(telegram.sendNewLead).toHaveBeenCalledWith(mockLead);
    });

    it('fires email notification after create', async () => {
      await service.create(dto as any, {});
      await Promise.resolve();
      expect(email.sendNewLead).toHaveBeenCalledWith(mockLead);
    });

    it('fires push notification after create', async () => {
      await service.create(dto as any, {});
      await Promise.resolve();
      expect(push.notifyNewLead).toHaveBeenCalledWith(mockLead);
    });

    it('does not block response if telegram throws', async () => {
      telegram.sendNewLead.mockRejectedValue(new Error('Telegram down'));
      // Should NOT throw — fire-and-forget
      await expect(service.create(dto as any, {})).resolves.toEqual(mockLead);
    });

    it('does not block response if email throws', async () => {
      email.sendNewLead.mockRejectedValue(new Error('Resend down'));
      await expect(service.create(dto as any, {})).resolves.toEqual(mockLead);
    });
  });

  describe('findOne', () => {
    it('returns lead when found', async () => {
      prisma.lead.findUnique.mockResolvedValue({ ...mockLead, notes: [], assignee: null });
      const result = await service.findOne(1);
      expect(result.id).toBe(1);
    });

    it('throws NotFoundException when lead does not exist', async () => {
      prisma.lead.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes lead and returns ok', async () => {
      prisma.lead.findUnique.mockResolvedValue({ ...mockLead, notes: [], assignee: null });
      prisma.lead.delete.mockResolvedValue(mockLead);
      const result = await service.remove(1);
      expect(result).toEqual({ ok: true });
    });

    it('throws NotFoundException when deleting non-existent lead', async () => {
      prisma.lead.findUnique.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
