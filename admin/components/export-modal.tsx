"use client";

import { useState, type FormEvent } from "react";
import { Download, X, CalendarRange } from "lucide-react";
import { downloadFile } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { Button } from "./button";
import { Input } from "./input";

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  /** Extra filters already applied in the current view (status / urgency / q). */
  baseFilters?: Record<string, string | undefined>;
}

export function ExportModal({ open, onClose, baseFilters = {} }: ExportModalProps) {
  const { lang } = useLang();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const labels =
    lang === "ru"
      ? {
          title: "Экспорт в Excel",
          subtitle: "Выберите диапазон дат для выгрузки заявок.",
          from: "Выбрать дату с",
          to: "Выбрать дату по",
          all: "За всё время",
          download: "Скачать .xlsx",
          downloading: "Скачивается…",
          cancel: "Отмена",
          last7: "7 дней",
          last30: "30 дней",
          last90: "90 дней",
          error: "Ошибка при выгрузке файла.",
        }
      : {
          title: "Export to Excel",
          subtitle: "Pick a date range to export leads.",
          from: "Pick start date",
          to: "Pick end date",
          all: "All time",
          download: "Download .xlsx",
          downloading: "Downloading…",
          cancel: "Cancel",
          last7: "7 days",
          last30: "30 days",
          last90: "90 days",
          error: "Failed to export file.",
        };

  function applyQuickRange(days: number) {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - (days - 1));
    setTo(today.toISOString().slice(0, 10));
    setFrom(start.toISOString().slice(0, 10));
  }

  function clearRange() {
    setFrom("");
    setTo("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(baseFilters)) if (v) params.set(k, v);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const suffix = params.toString() ? `?${params.toString()}` : "";
      await downloadFile(`/leads/export${suffix}`, `leads-${new Date().toISOString().slice(0, 10)}.xlsx`);
      onClose();
    } catch {
      setError(labels.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[28px] border border-[rgba(6,44,73,0.08)] bg-white p-7 shadow-[0_28px_70px_rgba(6,44,73,0.20)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700">
              <CalendarRange size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-brand-700">{labels.title}</h2>
              <p className="mt-0.5 text-xs text-brand-700/60">{labels.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-brand-700/50 hover:bg-brand-50 hover:text-brand-700"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyQuickRange(7)}
              className="inline-flex h-8 items-center rounded-full border border-[rgba(6,44,73,0.10)] bg-white px-3 text-xs font-bold text-brand-700 hover:border-brand-700/30 hover:bg-brand-50"
            >
              {labels.last7}
            </button>
            <button
              type="button"
              onClick={() => applyQuickRange(30)}
              className="inline-flex h-8 items-center rounded-full border border-[rgba(6,44,73,0.10)] bg-white px-3 text-xs font-bold text-brand-700 hover:border-brand-700/30 hover:bg-brand-50"
            >
              {labels.last30}
            </button>
            <button
              type="button"
              onClick={() => applyQuickRange(90)}
              className="inline-flex h-8 items-center rounded-full border border-[rgba(6,44,73,0.10)] bg-white px-3 text-xs font-bold text-brand-700 hover:border-brand-700/30 hover:bg-brand-50"
            >
              {labels.last90}
            </button>
            <button
              type="button"
              onClick={clearRange}
              className="inline-flex h-8 items-center rounded-full border border-dashed border-[rgba(6,44,73,0.20)] bg-white px-3 text-xs font-bold text-brand-700/60 hover:bg-brand-50"
            >
              {labels.all}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide text-brand-700">{labels.from}</label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide text-brand-700">{labels.to}</label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              {labels.cancel}
            </Button>
            <Button type="submit" disabled={busy}>
              <Download size={14} />
              {busy ? labels.downloading : labels.download}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
