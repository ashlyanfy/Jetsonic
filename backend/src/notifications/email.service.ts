import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import type { Lead } from '@prisma/client';

/**
 * Sends email notifications via SMTP (Zoho Mail).
 * Requires env vars:
 *   SMTP_HOST      — smtp.zoho.com
 *   SMTP_PORT      — 587
 *   SMTP_USER      — sales@jetsonic.aero
 *   SMTP_PASSWORD  — your Zoho password
 *   MAIL_FROM      — "Jetsonic <sales@jetsonic.aero>"
 *   MAIL_TO        — sales@jetsonic.aero
 */
@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;

  onModuleInit() {
    if (!this.isConfigured()) {
      const missing: string[] = [];
      if (!process.env.SMTP_HOST) missing.push('SMTP_HOST');
      if (!process.env.SMTP_USER) missing.push('SMTP_USER');
      if (!process.env.SMTP_PASSWORD) missing.push('SMTP_PASSWORD');
      this.logger.warn(`Email disabled — missing env: ${missing.join(', ')}`);
      return;
    }

    this.transporter = createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    this.logger.log(`Email notifications configured (${process.env.SMTP_USER})`);
  }

  isConfigured() {
    return !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD
    );
  }

  async sendNewLead(lead: Lead) {
    if (!this.isConfigured() || !this.transporter) {
      this.logger.debug('Email not configured, skipping');
      return;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
        to: process.env.MAIL_TO ?? process.env.SMTP_USER,
        subject: this.buildSubject(lead),
        html: this.buildHtml(lead),
      });

      this.logger.log(`Email notification sent for lead #${lead.id}`);
    } catch (err) {
      this.logger.error(`Email send error: ${(err as Error).message}`);
    }
  }

  private buildSubject(lead: Lead): string {
    const urgency = lead.urgency === 'AOG' ? '🚨 AOG' : lead.urgency === 'Priority' ? '⚡ Priority' : '📋';
    return `${urgency} New ${lead.requestType ?? 'RFQ'} #${lead.id} — ${lead.name}${lead.company ? ` (${lead.company})` : ''}`;
  }

  private buildHtml(lead: Lead): string {
    const esc = (v: string | null | undefined) =>
      (v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const adminUrl = `${process.env.ADMIN_BASE_URL ?? 'https://admin-jetsonic.up.railway.app'}/leads/${lead.id}`;

    const urgencyColor = lead.urgency === 'AOG' ? '#dc2626' : lead.urgency === 'Priority' ? '#d97706' : '#2563eb';
    const urgencyLabel = lead.urgency ?? 'Normal';

    const row = (label: string, value: string | null | undefined) =>
      value
        ? `<tr><td style="padding:6px 12px;color:#6b7280;font-size:13px;white-space:nowrap">${label}</td><td style="padding:6px 12px;font-size:14px;color:#111827">${esc(value)}</td></tr>`
        : '';

    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">

    <!-- Header -->
    <div style="background:#0f172a;padding:24px 32px">
      <div style="font-size:20px;font-weight:700;color:#fff">✈️ Jetsonic</div>
      <div style="font-size:13px;color:#94a3b8;margin-top:4px">New lead notification</div>
    </div>

    <!-- Urgency badge -->
    <div style="padding:16px 32px;background:#f8fafc;border-bottom:1px solid #e2e8f0">
      <span style="display:inline-block;padding:4px 12px;border-radius:9999px;font-size:13px;font-weight:600;background:${urgencyColor};color:#fff">
        ${esc(urgencyLabel)}
      </span>
      <span style="margin-left:12px;font-size:14px;color:#64748b">
        ${esc(lead.requestType ?? 'RFQ')} · Lead #${lead.id}
      </span>
    </div>

    <!-- Contact info -->
    <div style="padding:24px 32px 0">
      <div style="font-size:16px;font-weight:700;color:#111827">${esc(lead.name)}</div>
      ${lead.company ? `<div style="font-size:14px;color:#6b7280;margin-top:2px">${esc(lead.company)}${lead.role ? ` · ${esc(lead.role)}` : ''}</div>` : ''}
      <div style="margin-top:8px;font-size:14px">
        ${lead.email ? `<a href="mailto:${esc(lead.email)}" style="color:#2563eb">${esc(lead.email)}</a>` : ''}
        ${lead.phone ? `<span style="margin-left:16px;color:#374151">${esc(lead.phone)}</span>` : ''}
      </div>
    </div>

    <!-- Details table -->
    <div style="padding:16px 32px">
      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden">
        ${row('Part Number', lead.partNumber)}
        ${row('Alt Part #', lead.altPartNumber)}
        ${row('Aircraft', lead.aircraftType)}
        ${row('Tail #', lead.tailNumber)}
        ${row('ATA Chapter', lead.ataChapter)}
        ${row('Quantity', lead.quantity)}
        ${row('Condition', lead.condition)}
        ${row('Certificate', lead.certificate)}
        ${row('Target Date', lead.targetDate ? new Date(lead.targetDate).toISOString().slice(0, 10) : null)}
        ${row('Delivery', lead.deliveryLocation)}
      </table>
    </div>

    <!-- Message -->
    ${lead.message ? `
    <div style="padding:0 32px 24px">
      <div style="font-size:13px;color:#6b7280;margin-bottom:6px">Message</div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px 16px;font-size:14px;color:#374151;line-height:1.6">
        ${esc(lead.message)}
      </div>
    </div>` : ''}

    <!-- CTA -->
    <div style="padding:0 32px 32px">
      <a href="${adminUrl}" style="display:inline-block;padding:10px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600">
        Open in Admin Panel →
      </a>
    </div>

    <!-- Footer -->
    <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8">
      Jetsonic · jetsonic.aero · This is an automated notification
    </div>

  </div>
</body>
</html>`;
  }
}
