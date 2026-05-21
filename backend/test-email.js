/**
 * Quick SMTP test — run from backend folder:
 *   node test-email.js
 *
 * Set env vars before running:
 *   $env:SMTP_USER="sales@jetsonic.aero"
 *   $env:SMTP_PASSWORD="your_password"
 */

const nodemailer = require('nodemailer');

const user = process.env.SMTP_USER || 'sales@jetsonic.aero';
const pass = process.env.SMTP_PASSWORD;

if (!pass) {
  console.error('❌ Set SMTP_PASSWORD env var first');
  process.exit(1);
}

async function test(config, label) {
  console.log(`\n🔄 Testing: ${label}`);
  console.log(`   host=${config.host} port=${config.port} secure=${config.secure}`);
  const t = nodemailer.createTransport({ ...config, auth: { user, pass } });
  try {
    await Promise.race([
      t.verify(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT after 10s')), 10000)),
    ]);
    console.log(`✅ ${label} — connection OK`);
    return t;
  } catch (e) {
    console.error(`❌ ${label} — ${e.message}`);
    return null;
  }
}

async function main() {
  console.log(`\n📧 Testing Zoho SMTP for: ${user}\n`);

  // Try all common Zoho SMTP configs
  const configs = [
    { host: 'smtp.zoho.com', port: 587, secure: false },
    { host: 'smtp.zoho.com', port: 465, secure: true  },
    { host: 'smtp.zoho.eu',  port: 587, secure: false },
    { host: 'smtp.zoho.eu',  port: 465, secure: true  },
  ];

  let working = null;
  for (const cfg of configs) {
    const label = `${cfg.host}:${cfg.port} (${cfg.secure ? 'SSL' : 'STARTTLS'})`;
    const t = await test(cfg, label);
    if (t && !working) working = { t, cfg };
  }

  if (!working) {
    console.log('\n❌ No working config found.');
    console.log('👉 Check in Zoho Mail: Settings → Mail Accounts → IMAP/POP/SMTP → Enable SMTP');
    return;
  }

  console.log(`\n✅ Working config: ${working.cfg.host}:${working.cfg.port}`);
  console.log('\n📨 Sending test email...');

  try {
    const info = await working.t.sendMail({
      from: `Jetsonic Test <${user}>`,
      to: user,
      subject: '✅ Zoho SMTP test — working!',
      text: 'If you see this, SMTP is configured correctly.',
    });
    console.log(`✅ Email sent! Message ID: ${info.messageId}`);
    console.log(`\n📋 Use these settings in Railway:`);
    console.log(`   SMTP_HOST=${working.cfg.host}`);
    console.log(`   SMTP_PORT=${working.cfg.port}`);
  } catch (e) {
    console.error(`❌ Send failed: ${e.message}`);
  }
}

main();
