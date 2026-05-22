import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TelegramService } from '../src/notifications/telegram.service';
import { EmailService } from '../src/notifications/email.service';
import { PushService } from '../src/notifications/push.service';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        lead: { create: jest.fn(), findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
        pushSubscription: { findMany: jest.fn().mockResolvedValue([]) },
        setting: { findUnique: jest.fn().mockResolvedValue(null) },
        $connect: jest.fn(),
        $disconnect: jest.fn(),
      })
      .overrideProvider(TelegramService)
      .useValue({ sendNewLead: jest.fn(), isConfigured: () => false })
      .overrideProvider(EmailService)
      .useValue({ sendNewLead: jest.fn(), isConfigured: () => false })
      .overrideProvider(PushService)
      .useValue({ notifyNewLead: jest.fn() })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/auth/me — returns 401 without token', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .expect(401);
  });

  it('GET /api/v1/leads — returns 401 without token', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/leads')
      .expect(401);
  });

  it('DELETE /api/v1/leads/1 — returns 401 without token', async () => {
    await request(app.getHttpServer())
      .delete('/api/v1/leads/1')
      .expect(401);
  });
});
