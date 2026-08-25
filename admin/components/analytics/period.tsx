"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export interface Period {
  from: string;
  to: string;
}

/** YYYY-MM-DD shifted by `days` from today (local time). */
export function shiftISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-CA");
}

export function todayISO(): string {
  return shiftISO(0);
}

/** Shared period state for the monitoring blocks. Defaults to the last 7 days. */
export function usePeriod(): [Period, (p: Period) => void] {
  const [period, setPeriod] = useState<Period>({ from: shiftISO(-6), to: todayISO() });
  return [period, setPeriod];
}

interface PeriodPickerProps {
  period: Period;
  onChange: (p: Period) => void;
}

export function PeriodPicker({ period, onChange }: PeriodPickerProps) {
  const { lang } = useLang();

  const labels =
    lang === "ru"
      ? { today: "Сегодня", yesterday: "Вчера", week: "7 дней", month: "30 дней", from: "С", to: "По" }
      : { today: "Today", yesterday: "Yesterday", week: "7 days", month: "30 days", from: "From", to: "To" };

  const presets = [
    { label: labels.today, from: todayISO(), to: todayISO() },
    { label: labels.yesterday, from: shiftISO(-1), to: shiftISO(-1) },
    { label: labels.week, from: shiftISO(-6), to: todayISO() },
    { label: labels.month, from: shiftISO(-29), to: todayISO() },
  ];

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => {
          const active = period.from === p.from && period.to === p.to;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange({ from: p.from, to: p.to })}
              className={cn(
                "inline-flex h-8 items-center rounded-full px-3 text-xs font-bold transition",
                active
                  ? "bg-brand-700 text-white shadow-[0_8px_20px_rgba(5,54,92,0.25)]"
                  : "bg-white text-brand-700/70 ring-1 ring-[rgba(6,44,73,0.10)] hover:bg-brand-50 hover:text-brand-700",
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-700/50">
        {labels.from}
        <input
          type="date"
          value={period.from}
          max={period.to}
          onChange={(e) => e.target.value && onChange({ ...period, from: e.target.value })}
          className="h-8 rounded-xl border border-[rgba(6,44,73,0.12)] bg-white px-2.5 text-xs font-bold text-brand-700 outline-none focus:border-brand-500"
        />
      </label>
      <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-700/50">
        {labels.to}
        <input
          type="date"
          value={period.to}
          min={period.from}
          onChange={(e) => e.target.value && onChange({ ...period, to: e.target.value })}
          className="h-8 rounded-xl border border-[rgba(6,44,73,0.12)] bg-white px-2.5 text-xs font-bold text-brand-700 outline-none focus:border-brand-500"
        />
      </label>
    </div>
  );
}
