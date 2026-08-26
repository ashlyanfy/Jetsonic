import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { Lead } from '@prisma/client';
import { SettingsService, SETTING_KEYS } from '../settings/settings.service';
import { withRetry } from './retry.util';

/**
 * Sends Telegram messages via the official Bot API.
 * Requires env vars:
 *   TELEGRAM_BOT_TOKEN  — secret bot token from @BotFather
 *   TELEGRAM_CHAT_ID    — fallback chat id (overridden by DB setting if set via admin panel)
 *   ADMIN_BASE_URL      — optional, used to build the lead detail link
 */
@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);

  constructor(private readonly settingsService: SettingsService) {}

  onModuleInit() {
    if (this.token) {
      this.logger.log('Telegram notifications configured (chat ID from DB or env)');
    } else {
      this.logger.warn('Telegram disabled — missing env: TELEGRAM_BOT_TOKEN');
    }
  }

  private get token() {
    return process.env.TELEGRAM_BOT_TOKEN ?? '';
  }

  private get adminBaseUrl() {
    return process.env.ADMIN_BASE_URL ?? 'https://admin-jetsonic.up.railway.app';
  }

  /** Returns chat ID from DB (set via admin panel) or falls back to env var */
  private async resolveChatId(): Promise<string> {
    // A settings lookup failure must not kill the notification: for three
    // months every Telegram send died here on a missing table. Fall back to
    // the env var and let the message go out.
    try {
      const fromDb = await this.settingsService.get(SETTING_KEYS.TELEGRAM_CHAT_ID);
      if (fromDb && fromDb.trim()) return fromDb.trim();
    } catch (err) {
      this.logger.warn(`Settings lookup failed, using TELEGRAM_CHAT_ID env fallback: ${(err as Error).message.split('\n')[0]}`);
    }
    return process.env.TELEGRAM_CHAT_ID ?? '';
  }

  async sendNewLead(lead: Lead) {
    if (!this.token) {
      this.logger.debug('Telegram not configured, skipping');
      return;
    }

    const chatId = await this.resolveChatId();
    if (!chatId) {
      this.logger.warn('Telegram chat ID not set — skipping. Set it in admin panel Settings or TELEGRAM_CHAT_ID env var.');
      return;
    }

    const text = this.formatLead(lead);

    try {
      await withRetry(async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);
        const res = await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          }),
        });
        clearTimeout(timeout);
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Telegram API ${res.status}: ${body}`);
        }
      });

      this.logger.log(`Telegram notification sent for lead #${lead.id}`);
    } catch (err) {
      this.logger.error(`Telegram send failed after retries: ${(err as Error).message}`);
    }
  }

  private formatLead(lead: Lead) {
    const escape = (v: string | null | undefined) =>
      (v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const urgencyIcon =
      lead.urgency === 'AOG' ? '🚨' : lead.urgency === 'Priority' ? '⚡' : '📋';
    const typeIcon =
      lead.requestType === 'AOG' ? '🚨' :
      lead.requestType === 'Repair' ? '🔧' :
      lead.requestType === 'Docs' ? '📄' : '✈️';

    const lines: string[] = [];

    lines.push(`${urgencyIcon} <b>New ${escape(lead.requestType ?? 'RFQ')} request #${lead.id}</b>`);
    lines.push('');
    lines.push(`👤 <b>${escape(lead.name)}</b>`);
    if (lead.company) lines.push(`🏢 ${escape(lead.company)}${lead.role ? ` · ${escape(lead.role)}` : ''}`);
    lines.push('');

    const contact: string[] = [];
    if (lead.phone) contact.push(`📞 ${escape(lead.phone)}`);
    if (lead.email) contact.push(`✉️ <a href="mailto:${escape(lead.email)}">${escape(lead.email)}</a>`);
    if (contact.length) {
      lines.push(contact.join('   '));
      lines.push('');
    }

    lines.push(`${typeIcon} <b>${escape(lead.requestType ?? '—')}</b>   ${urgencyIcon} <b>${escape(lead.urgency ?? '—')}</b>`);

    const tech: string[] = [];
    if (lead.partNumber) tech.push(`<b>P/N:</b> <code>${escape(lead.partNumber)}</code>`);
    if (lead.altPartNumber) tech.push(`<b>Alt:</b> <code>${escape(lead.altPartNumber)}</code>`);
    if (lead.aircraftType) tech.push(`<b>Aircraft:</b> ${escape(lead.aircraftType)}`);
    if (lead.tailNumber) tech.push(`<b>Tail:</b> ${escape(lead.tailNumber)}`);
    if (lead.ataChapter) tech.push(`<b>ATA:</b> ${escape(lead.ataChapter)}`);
    if (lead.quantity) tech.push(`<b>Qty:</b> ${escape(lead.quantity)}`);
    if (lead.condition) tech.push(`<b>Condition:</b> ${escape(lead.condition)}`);
    if (lead.certificate) tech.push(`<b>Cert:</b> ${escape(lead.certificate)}`);

    if (tech.length) {
      lines.push('');
      lines.push(tech.join('\n'));
    }

    if (lead.targetDate) {
      lines.push('');
      lines.push(`📅 <b>Target:</b> ${new Date(lead.targetDate).toISOString().slice(0, 10)}`);
    }

    if (lead.deliveryLocation) {
      lines.push(`📍 <b>Delivery:</b> ${escape(lead.deliveryLocation)}`);
    }

    if (lead.message) {
      lines.push('');
      lines.push(`💬 <i>${escape(lead.message.slice(0, 500))}${lead.message.length > 500 ? '…' : ''}</i>`);
    }

    lines.push('');
    lines.push(`🔗 <a href="${this.adminBaseUrl}/leads/${lead.id}">Open in admin</a>`);

    return lines.join('\n');
  }
}
