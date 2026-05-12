"use client";

import type { LeadStatus } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const statusStyles: Record<LeadStatus, string> = {
  NEW: "bg-brand-50 text-brand-700 ring-1 ring-brand-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  PLANNED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  REJECTED: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  CONVERTED: "bg-accent-500/10 text-accent-600 ring-1 ring-accent-500/30",
};

const urgencyStyles: Record<string, string> = {
  AOG: "bg-red-50 text-red-700 ring-1 ring-red-200",
  Priority: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  Routine: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  const { t } = useLang();
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-3 text-xs font-bold tracking-tight",
        statusStyles[status],
      )}
    >
      {t(`status_${status}` as const)}
    </span>
  );
}

const urgencyLabels: Record<string, { en: string; ru: string }> = {
  AOG: { en: "AOG", ru: "AOG" },
  Priority: { en: "Priority", ru: "Приоритет" },
  Routine: { en: "Routine", ru: "Плановая" },
};

export function UrgencyBadge({ urgency }: { urgency: string | null }) {
  const { lang } = useLang();
  if (!urgency) return <span className="text-xs text-slate-400">—</span>;
  const style = urgencyStyles[urgency] ?? "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  const label = urgencyLabels[urgency]?.[lang] ?? urgency;
  return (
    <span className={cn("inline-flex h-7 items-center rounded-full px-3 text-xs font-bold tracking-tight", style)}>
      {label}
    </span>
  );
}
