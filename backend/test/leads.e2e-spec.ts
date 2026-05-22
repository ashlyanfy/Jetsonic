import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TelegramService } from '../src/notifications/telegram.service';
import { EmailService } from '../src/notifications/email.service';
import { PushService } from '../src/notifications/push.service';

/**
 * E2E tests for POST /api/v1/leads (public endpoint).
 * Uses the real NestJS application but mocks:
 *   - PrismaService (no real DB needed)
 *   - TelegramService / EmailService / PushService (no real API calls)
 */
describe('POST /api/v1/leads', () => {
  let app: INestApplication;
  let prismaCreate: jest.Mock;

  const validPayload = {
    name: 'Ahmed Al-Rashidi',
    email: 'ahmed@airline.com',
    company: 'Gulf Air',
    requestType: 'RFQ',
    urgency: 'Priority',
    partNumber: '65-45631-7',
    aircraftType: 'Boeing 737-800',
    quantity: '2',
    condition: 'Serviceable',
    certificate: 'EASA Form 1',
    deliveryLocation: 'Bahrain International Airport',
  };

  const mockLead = { id: 42, ...validPayload, status: 'NEW', createdAt: new Date(), updatedAt: new Date() };

  beforeAll(async () => {
    prismaCreate = jest.fn().mockResolvedValue(mockLead);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        lead: { create: prismaCreate },
        pushSubscription: { findMany: jest.fn().mockResolvedValue([]) },
        setting: { findUnique: jest.fn().mockResolvedValue(null) },
        $connect: jest.fn(),
        $disconnect: jest.fn(),
      })
      .overrideProvider(TelegramService)
      .useValue({ sendNewLead: jest.fn().mockResolvedValue(undefined), isConfigured: () => false })
      .overrideProvider(EmailService)
      .useValue({ sendNewLead: jest.fn().mockResolvedValue(undefined), isConfigured: () => false })
      .overrideProvider(PushService)
      .useValue({ notifyNewLead: jest.fn().mockResolvedValue(undefined) })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('201 — creates a lead with valid payload', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/leads')
      .send(validPayload)
      .expect(201);

    expect(res.body.ok).toBe(true);
    expect(res.body.id).toBe(42);
    expect(prismaCreate).toHaveBeenCalledTimes(1);
  });

  it('400 — rejects request without required name field', async () => {
    const { name: _name, ...withoutName } = validPayload;
    await request(app.getHttpServer())
      .post('/api/v1/leads')
      .send(withoutName)
      .expect(400);
  });

  it('400 — rejects request with invalid email', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/leads')
      .send({ ...validPayload, email: 'not-an-email' })
      .expect(400);
  });

  it('400 — rejects request with unknown extra fields (whitelist)', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/leads')
      .send({ ...validPayload, injectedField: '<script>alert(1)</script>' })
      .expect(400);
  });

  it('400 — detects honeypot field (bot detection)', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/leads')
      .send({ ...validPayload, botField: 'filled-by-bot' })
      .expect(400);
  });

  it('400 — rejects name exceeding max length', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/leads')
      .send({ ...validPayload, name: 'A'.repeat(121) })
      .expect(400);
  });
});
