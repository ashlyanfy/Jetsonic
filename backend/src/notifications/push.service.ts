import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { Lead } from '@prisma/client';
import * as webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private configured = false;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT ?? 'mailto:sales@jetsonic.aero';

    if (!publicKey || !privateKey) {
      this.logger.warn('VAPID keys not set — push notifications disabled');
      return;
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);
    this.configured = true;
    this.logger.log('Push notifications configured');
  }

  isConfigured() {
    return this.configured;
  }

  getPublicKey() {
    return process.env.VAPID_PUBLIC_KEY ?? null;
  }

  async subscribe(data: { endpoint: string; p256dh: string; auth: string }, userId?: string) {
    return this.prisma.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      update: { p256dh: data.p256dh, auth: data.auth, ...(userId ? { userId } : {}) },
      create: {
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
        userId: userId ?? null,
      },
    });
  }

  async unsubscribe(endpoint: string) {
    await this.prisma.pushSubscription.deleteMany({ where: { endpoint } });
    return { ok: true };
  }

  async sendToAll(payload: PushPayload) {
    if (!this.configured) return;

    const subs = await this.prisma.pushSubscription.findMany();
    const json = JSON.stringify(payload);

    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            json,
          );
        } catch (err) {
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            await this.prisma.pushSubscription.delete({ where: { id: sub.id } });
            this.logger.log(`Removed stale subscription ${sub.id}`);
          } else {
            this.logger.warn(`Push send failed for sub ${sub.id}: ${(err as Error).message}`);
          }
        }
      }),
    );
  }

  async sendTest(userId?: string) {
    const where = userId ? { userId } : {};
    const subs = await this.prisma.pushSubscription.findMany({ where });
    if (subs.length === 0) return { sent: 0 };

    const payload: PushPayload = {
      title: 'Jetsonic Admin',
      body: 'Push notifications are working ✈️',
      url: process.env.ADMIN_BASE_URL ?? '/',
      tag: 'jetsonic-test',
    };
    await this.sendToAll(payload);
    return { sent: subs.length };
  }

  async notifyNewLead(lead: Lead) {
    if (!this.configured) return;

    const urgencyIcon = lead.urgency === 'AOG' ? '🚨' : lead.urgency === 'Priority' ? '⚡' : '📋';
    const title = `${urgencyIcon} New ${lead.requestType ?? 'RFQ'} #${lead.id}`;
    const parts: string[] = [lead.name];
    if (lead.company) parts.push(lead.company);
    if (lead.partNumber) parts.push(`P/N ${lead.partNumber}`);
    const body = parts.join(' · ');

    await this.sendToAll({
      title,
      body,
      url: `/leads/${lead.id}`,
      tag: `lead-${lead.id}`,
    });
  }
}
