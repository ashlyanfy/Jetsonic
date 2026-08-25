"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  Eye,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  Send,
  Users,
} from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { cn, formatDate } from "@/lib/utils";
import type {
  SiteEventListResponse,
  SiteEventPageBreakdown,
  SiteEventStats,
} from "@/lib/types";
import { EventBadge } from "./event-badge";
import type { Period } from "./period";

/**
 * Visitor-action monitoring for the selected period: stat cards,
 * per-page breakdown and the latest actions feed.
 */
export function MonitoringPanel({ period }: { period: Period }) {
  const { lang } = useLang();
  const range = { from: period.from, to: period.to };

  const stats = useQuery({
    queryKey: ["events-stats", period.from, period.to],
    queryFn: () => api<SiteEventStats>("/events/stats", { query: range }),
    refetchInterval: 30_000,
  });

  const byPage = useQuery({
    queryKey: ["events-by-page", period.from, period.to],
    queryFn: () => api<SiteEventPageBreakdown>("/events/by-page", { query: range }),
    refetchInterval: 60_000,
  });

  const recent = useQuery({
    queryKey: ["events-recent", period.from, period.to],
    queryFn: () =>
      api<SiteEventListResponse>("/events", { query: { ...range, page: 1, pageSize: 10 } }),
    refetchInterval: 30_000,
  });

  const labels =
    lang === "ru"
      ? {
          visitors: "Посетители",
          views: "Просмотры",
          whatsapp: "WhatsApp",
          call: "Звонки",
          email: "Почта",
          formStart: "Открыли форму",
          rfq: "Заявки",
          actions: "Всего действий",
          byPage: "Действия по страницам",
          pageCol: "Страница",
          viewsCol: "Просм.",
          totalCol: "Всего",
          recent: "Последние действия",
          viewAll: "Весь журнал",
          empty: "За выбранный период действий нет.",
        }
      : {
          visitors: "Visitors",
          views: "Page views",
          whatsapp: "WhatsApp",
          call: "Calls",
          email: "Email",
          formStart: "Form opens",
          rfq: "RFQs",
          actions: "Total actions",
          byPage: "Actions by page",
          pageCol: "Page",
          viewsCol: "Views",
          totalCol: "Total",
          recent: "Recent actions",
          viewAll: "Full journal",
          empty: "No actions in the selected period.",
        };

  const s = stats.data;
  const cards = [
    { label: labels.visitors, value: s?.uniqueVisitors, Icon: Users, iconBg: "bg-brand-50 text-brand-700", accent: "from-brand-700 to-brand-600" },
    { label: labels.views, value: s?.pageViews, Icon: Eye, iconBg: "bg-accent-500/10 text-accent-600", accent: "from-accent-500 to-accent-400" },
    { label: labels.whatsapp, value: s?.whatsapp, Icon: MessageCircle, iconBg: "bg-emerald-50 text-emerald-600", accent: "from-emerald-500 to-emerald-400" },
    { label: labels.call, value: s?.call, Icon: Phone, iconBg: "bg-blue-50 text-blue-600", accent: "from-blue-500 to-blue-400" },
    { label: labels.email, value: s?.email, Icon: Mail, iconBg: "bg-sky-50 text-sky-600", accent: "from-sky-500 to-sky-400" },
    { label: labels.formStart, value: s?.formStart, Icon: FileText, iconBg: "bg-amber-50 text-amber-600", accent: "from-amber-500 to-amber-400" },
    { label: labels.rfq, value: s?.rfqSubmit, Icon: Send, iconBg: "bg-violet-50 text-violet-600", accent: "from-violet-500 to-violet-400" },
    { label: labels.actions, value: s?.actions, Icon: Activity, iconBg: "bg-red-50 text-red-500", accent: "from-red-500 to-red-400" },
  ];

  return (
    <div className="space-y-4">
      {/* Stat cards — 2 per row on phones, 4 on desktop. */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="relative overflow-hidden rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/90 p-4 shadow-[0_18px_45px_rgba(6,44,73,0.06)] sm:p-5"
          >
            <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", c.accent)} />
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700/60 sm:text-[11px]">
                  {c.label}
                </p>
                <p className="mt-2 text-2xl font-black tracking-tight text-brand-700 tabular-nums sm:text-3xl">
                  {stats.isLoading ? "—" : (c.value ?? 0)}
                </p>
              </div>
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl sm:h-12 sm:w-12", c.iconBg)}>
                <c.Icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Per-page breakdown */}
        <section className="overflow-hidden rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/90 shadow-[0_18px_45px_rgba(6,44,73,0.08)]">
          <div className="border-b border-[rgba(6,44,73,0.06)] bg-brand-50/40 px-5 py-3">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700/70">{labels.byPage}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="border-b border-[rgba(6,44,73,0.05)] bg-brand-50/30 text-left text-[10px] uppercase tracking-[0.12em] text-brand-700/70">
                <tr>
                  <th className="px-5 py-2.5 font-bold">{labels.pageCol}</th>
                  <th className="px-2 py-2.5 text-center font-bold">{labels.viewsCol}</th>
                  <th className="px-2 py-2.5 text-center font-bold">WA</th>
                  <th className="px-2 py-2.5 text-center font-bold">{labels.call}</th>
                  <th className="px-2 py-2.5 text-center font-bold">{labels.email}</th>
                  <th className="px-2 py-2.5 text-center font-bold">{labels.rfq}</th>
                  <th className="px-3 py-2.5 text-center font-bold">{labels.totalCol}</th>
                </tr>
              </thead>
              <tbody>
                {byPage.data?.items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-sm text-brand-700/60">
                      {labels.empty}
                    </td>
                  </tr>
                )}
                {byPage.data?.items.slice(0, 8).map((row) => (
                  <tr key={row.page} className="border-b border-[rgba(6,44,73,0.05)] last:border-0">
                    <td className="max-w-[180px] truncate px-5 py-2.5 font-bold text-brand-700">{row.page}</td>
                    <td className="px-2 py-2.5 text-center tabular-nums text-brand-900/80">{row.pageViews}</td>
                    <td className="px-2 py-2.5 text-center tabular-nums text-brand-900/80">{row.whatsapp}</td>
                    <td className="px-2 py-2.5 text-center tabular-nums text-brand-900/80">{row.call}</td>
                    <td className="px-2 py-2.5 text-center tabular-nums text-brand-900/80">{row.email}</td>
                    <td className="px-2 py-2.5 text-center tabular-nums text-brand-900/80">{row.rfqSubmit}</td>
                    <td className="px-3 py-2.5 text-center font-black tabular-nums text-brand-700">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent actions feed */}
        <section className="overflow-hidden rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/90 shadow-[0_18px_45px_rgba(6,44,73,0.08)]">
          <div className="flex items-center justify-between border-b border-[rgba(6,44,73,0.06)] bg-brand-50/40 px-5 py-3">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700/70">{labels.recent}</h2>
            <Link
              href="/analytics"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:underline"
            >
              {labels.viewAll}
              <ArrowRight size={12} />
            </Link>
          </div>
          <div className="max-h-[340px] overflow-y-auto">
            {recent.data?.items.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-brand-700/60">{labels.empty}</div>
            )}
            {recent.data?.items.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between gap-3 border-b border-[rgba(6,44,73,0.05)] px-5 py-2.5 last:border-0"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <EventBadge type={event.type} />
                  <span className="truncate text-xs text-brand-700/60">{event.page ?? "—"}</span>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-brand-700/60">{formatDate(event.createdAt)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
