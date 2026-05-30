/**
 * One-time script: rename admin@jetsonic.local → sales@jetsonic.aero
 * Run: npx ts-node -r tsconfig-paths/register prisma/migrate-admin-email.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const OLD_EMAIL = 'admin@jetsonic.local';
  const NEW_EMAIL = 'sales@jetsonic.aero';

  const existing = await prisma.user.findUnique({ where: { email: OLD_EMAIL } });
  if (!existing) {
    console.log(`No user with email ${OLD_EMAIL} found — nothing to do.`);
    return;
  }

  const conflict = await prisma.user.findUnique({ where: { email: NEW_EMAIL } });
  if (conflict) {
    console.log(`User with email ${NEW_EMAIL} already exists (id: ${conflict.id}) — skipping.`);
    return;
  }

  await prisma.user.update({ where: { email: OLD_EMAIL }, data: { email: NEW_EMAIL } });
  console.log(`Updated admin email: ${OLD_EMAIL} → ${NEW_EMAIL}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
