"use client";

import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { SiteEventType } from "@/lib/types";

export const EVENT_LABELS: Record<SiteEventType, { en: string; ru: string }> = {
  PAGE_VIEW: { en: "Page view", ru: "Просмотр" },
  WHATSAPP: { en: "WhatsApp", ru: "WhatsApp" },
  CALL: { en: "Call", ru: "Звонок" },
  EMAIL: { en: "Email", ru: "Почта" },
  FORM_START: { en: "Form opened", ru: "Открыл форму" },
  RFQ_SUBMIT: { en: "RFQ submitted", ru: "Заявка" },
};

const EVENT_CLASSES: Record<SiteEventType, string> = {
  PAGE_VIEW: "bg-slate-100 text-slate-600",
  WHATSAPP: "bg-emerald-100 text-emerald-700",
  CALL: "bg-blue-100 text-blue-700",
  EMAIL: "bg-sky-100 text-sky-700",
  FORM_START: "bg-amber-100 text-amber-700",
  RFQ_SUBMIT: "bg-violet-100 text-violet-700",
};

export function EventBadge({ type }: { type: SiteEventType }) {
  const { lang } = useLang();
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold",
        EVENT_CLASSES[type],
      )}
    >
      {EVENT_LABELS[type][lang]}
    </span>
  );
}
