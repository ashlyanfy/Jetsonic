-- Repair migration: the Setting model existed in schema.prisma since the
-- settings feature shipped, but no migration was ever generated for it, so
-- production never got the table. Every Telegram notification failed on the
-- settings lookup because of this. IF NOT EXISTS keeps the migration safe for
-- environments where the table was created manually or via `db push`.

-- CreateTable
CREATE TABLE IF NOT EXISTS "Setting" (
    "key"       TEXT NOT NULL,
    "value"     TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);
