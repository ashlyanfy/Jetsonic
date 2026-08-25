"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import type { LeadListResponse } from "@/lib/types";
import { StatsBar } from "@/components/stats-bar";
import { LeadsChart } from "@/components/leads-chart";
import { StatusBadge, UrgencyBadge } from "@/components/status-badge";
import { ActivityChart } from "@/components/analytics/activity-chart";
import { MonitoringPanel } from "@/components/analytics/monitoring-panel";
import { PeriodPicker, usePeriod } from "@/components/analytics/period";

export function MainView() {
  const { lang, t } = useLang();
  const [period, setPeriod] = usePeriod();

  const recent = useQuery({
    queryKey: ["leads", { page: 1, pageSize: 10 }],
    queryFn: () => api<LeadListResponse>("/leads", { query: { page: 1, pageSize: 10 } }),
    refetchInterval: 60_000,
  });

  const labels =
    lang === "ru"
      ? {
          eyebrow: "Кабинет менеджера",
          title: "Главная",
          subtitle: "Обзор активности и последние заявки.",
          recent: "Последние заявки",
          viewAll: "Все заявки",
          empty: "Заявок пока нет.",
          monitoring: "Действия посетителей",
        }
      : {
          eyebrow: "Manager workspace",
          title: "Dashboard",
          subtitle: "Overview of activity and recent leads.",
          recent: "Recent leads",
          viewAll: "All leads",
          empty: "No leads yet.",
          monitoring: "Visitor actions",
        };

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-7 p-4 sm:p-6 lg:p-8">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-600">{labels.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-brand-700">{labels.title}</h1>
        <p className="mt-2 max-w-xl text-sm text-slate-600">{labels.subtitle}</p>
      </header>

      {/* ── Visitor actions on the site for the selected period ── */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700/70">{labels.monitoring}</h2>
          <PeriodPicker period={period} onChange={setPeriod} />
        </div>
        <MonitoringPanel period={period} />
        <ActivityChart period={period} />
      </section>

      <LeadsChart />
      <StatsBar />

      <section className="overflow-hidden rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/90 shadow-[0_18px_45px_rgba(6,44,73,0.08)]">
        <div className="flex items-center justify-between border-b border-[rgba(6,44,73,0.06)] bg-brand-50/40 px-5 py-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700/70">{labels.recent}</h2>
          <Link
            href="/leads"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:underline"
          >
            {labels.viewAll}
            <ArrowRight size={12} />
          </Link>
        </div>

        {recent.isLoading && <div className="p-8 text-center text-brand-700/60">{t("loading")}</div>}
        {recent.isError && <div className="p-8 text-center text-red-600">{t("loadError")}</div>}

        {recent.data && recent.data.items.length === 0 && (
          <div className="p-10 text-center text-sm text-brand-700/60">{labels.empty}</div>
        )}

        {recent.data && recent.data.items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[rgba(6,44,73,0.05)] bg-brand-50/30 text-left text-[11px] uppercase tracking-[0.14em] text-brand-700/70">
                <tr>
                  <th className="px-5 py-3 font-bold">{t("colDate")}</th>
                  <th className="px-5 py-3 font-bold">{t("colName")}</th>
                  <th className="px-5 py-3 font-bold">{t("colCompany")}</th>
                  <th className="px-5 py-3 font-bold">{t("colPhone")}</th>
                  <th className="px-5 py-3 font-bold">{t("colType")}</th>
                  <th className="px-5 py-3 font-bold">{t("colUrgency")}</th>
                  <th className="px-5 py-3 font-bold">{t("colStatus")}</th>
                  <th className="px-5 py-3 text-right font-bold">{t("colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {recent.data.items.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-[rgba(6,44,73,0.05)] last:border-0 transition hover:bg-brand-50/40"
                  >
                    <td className="px-5 py-3.5 text-brand-700/70">{formatDate(lead.createdAt)}</td>
                    <td className="px-5 py-3.5 font-bold text-brand-700">{lead.name}</td>
                    <td className="px-5 py-3.5 text-brand-900/80">{lead.company ?? "—"}</td>
                    <td className="px-5 py-3.5 text-brand-900/80">{lead.phone ?? "—"}</td>
                    <td className="px-5 py-3.5 text-brand-900/80">{lead.requestType ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <UrgencyBadge urgency={lead.urgency} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="inline-flex h-8 items-center gap-1 rounded-full border border-[rgba(6,44,73,0.12)] bg-white px-3 text-xs font-bold text-brand-700 transition hover:border-brand-700/30 hover:bg-brand-50"
                      >
                        {t("open")}
                        <ChevronRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
