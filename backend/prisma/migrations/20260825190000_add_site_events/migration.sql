-- CreateEnum
CREATE TYPE "SiteEventType" AS ENUM ('PAGE_VIEW', 'WHATSAPP', 'CALL', 'EMAIL', 'FORM_START', 'RFQ_SUBMIT');

-- CreateTable
CREATE TABLE "SiteEvent" (
    "id"        SERIAL NOT NULL,
    "type"      "SiteEventType" NOT NULL,
    "page"      TEXT,
    "visitorId" TEXT NOT NULL,
    "ip"        TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SiteEvent_createdAt_idx" ON "SiteEvent"("createdAt");

-- CreateIndex
CREATE INDEX "SiteEvent_type_createdAt_idx" ON "SiteEvent"("type", "createdAt");

-- CreateIndex
CREATE INDEX "SiteEvent_visitorId_idx" ON "SiteEvent"("visitorId");

-- CreateIndex
CREATE INDEX "SiteEvent_page_idx" ON "SiteEvent"("page");
