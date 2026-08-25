"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import type { SiteEventListResponse, SiteEventType } from "@/lib/types";
import { ActivityChart } from "@/components/analytics/activity-chart";
import { EventBadge, EVENT_LABELS } from "@/components/analytics/event-badge";
import { MonitoringPanel } from "@/components/analytics/monitoring-panel";
import { PeriodPicker, usePeriod } from "@/components/analytics/period";

const PAGE_SIZE = 50;
const EVENT_TYPES = Object.keys(EVENT_LABELS) as SiteEventType[];

export function AnalyticsView() {
  const { lang, t } = useLang();
  const [period, setPeriodState] = usePeriod();
  const [typeFilter, setTypeFilter] = useState<SiteEventType | "">("");
  const [page, setPage] = useState(1);

  function setPeriod(p: { from: string; to: string }) {
    setPeriodState(p);
    setPage(1);
  }

  const journal = useQuery({
    queryKey: ["events-list", period.from, period.to, typeFilter, page],
    queryFn: () =>
      api<SiteEventListResponse>("/events", {
        query: {
          from: period.from,
          to: period.to,
          type: typeFilter || undefined,
          page,
          pageSize: PAGE_SIZE,
        },
      }),
    refetchInterval: 30_000,
  });

  const labels =
    lang === "ru"
      ? {
          eyebrow: "Мониторинг сайта",
          title: "Аналитика",
          subtitle: "Действия посетителей jetsonic.aero: просмотры, WhatsApp, звонки и заявки.",
          journal: "Журнал действий",
          allTypes: "Все действия",
          colDate: "Дата",
          colPage: "Страница",
          colAction: "Действие",
          colVisitor: "Посетитель",
          empty: "За выбранный период действий нет.",
        }
      : {
          eyebrow: "Site monitoring",
          title: "Analytics",
          subtitle: "Visitor actions on jetsonic.aero: page views, WhatsApp, calls and RFQs.",
          journal: "Action journal",
          allTypes: "All actions",
          colDate: "Date",
          colPage: "Page",
          colAction: "Action",
          colVisitor: "Visitor",
          empty: "No actions in the selected period.",
        };

  const totalPages = journal.data ? Math.max(1, journal.data.pages) : 1;

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-600">{labels.eyebrow}</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-brand-700">{labels.title}</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600">{labels.subtitle}</p>
        </div>
        <PeriodPicker period={period} onChange={setPeriod} />
      </header>

      <MonitoringPanel period={period} />
      <ActivityChart period={period} />

      {/* Full action journal */}
      <section className="overflow-hidden rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/90 shadow-[0_18px_45px_rgba(6,44,73,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(6,44,73,0.06)] bg-brand-50/40 px-5 py-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700/70">{labels.journal}</h2>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as SiteEventType | "");
              setPage(1);
            }}
            className="h-8 rounded-xl border border-[rgba(6,44,73,0.12)] bg-white px-2.5 text-xs font-bold text-brand-700 outline-none focus:border-brand-500"
          >
            <option value="">{labels.allTypes}</option>
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {EVENT_LABELS[type][lang]}
              </option>
            ))}
          </select>
        </div>

        {journal.isLoading && <div className="p-8 text-center text-brand-700/60">{t("loading")}</div>}
        {journal.isError && <div className="p-8 text-center text-red-600">{t("loadError")}</div>}

        {journal.data && journal.data.items.length === 0 && (
          <div className="p-10 text-center text-sm text-brand-700/60">{labels.empty}</div>
        )}

        {journal.data && journal.data.items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="border-b border-[rgba(6,44,73,0.05)] bg-brand-50/30 text-left text-[11px] uppercase tracking-[0.14em] text-brand-700/70">
                <tr>
                  <th className="px-5 py-3 font-bold">{labels.colDate}</th>
                  <th className="px-5 py-3 font-bold">{labels.colAction}</th>
                  <th className="px-5 py-3 font-bold">{labels.colPage}</th>
                  <th className="px-5 py-3 font-bold">{labels.colVisitor}</th>
                </tr>
              </thead>
              <tbody>
                {journal.data.items.map((event) => (
                  <tr key={event.id} className="border-b border-[rgba(6,44,73,0.05)] last:border-0 transition hover:bg-brand-50/40">
                    <td className="whitespace-nowrap px-5 py-3 tabular-nums text-brand-700/70">
                      {formatDate(event.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <EventBadge type={event.type} />
                    </td>
                    <td className="max-w-[220px] truncate px-5 py-3 text-brand-900/80">{event.page ?? "—"}</td>
                    <td className="px-5 py-3 font-mono text-xs text-brand-700/60">{event.visitorId.slice(0, 13)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {journal.data && journal.data.total > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-[rgba(6,44,73,0.06)] px-5 py-3 text-sm">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex h-9 items-center rounded-full border border-[rgba(6,44,73,0.12)] bg-white px-4 text-xs font-bold text-brand-700 transition hover:bg-brand-50 disabled:opacity-40"
            >
              {t("prev")}
            </button>
            <span className="text-xs font-bold text-brand-700/60">
              {t("page")} {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex h-9 items-center rounded-full border border-[rgba(6,44,73,0.12)] bg-white px-4 text-xs font-bold text-brand-700 transition hover:bg-brand-50 disabled:opacity-40"
            >
              {t("next")}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
