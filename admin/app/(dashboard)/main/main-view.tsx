"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import type { LeadListResponse } from "@/lib/types";
import { StatsBar } from "@/components/stats-bar";
import { LeadsChart } from "@/components/leads-chart";
import { StatusBadge, UrgencyBadge } from "@/components/status-badge";

export function MainView() {
  const { lang, t } = useLang();

  const recent = useQuery({
    queryKey: ["leads", { page: 1, pageSize: 5 }],
    queryFn: () => api<LeadListResponse>("/leads", { query: { page: 1, pageSize: 5 } }),
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
        }
      : {
          eyebrow: "Manager workspace",
          title: "Dashboard",
          subtitle: "Overview of activity and recent leads.",
          recent: "Recent leads",
          viewAll: "All leads",
          empty: "No leads yet.",
        };

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-7 p-4 sm:p-6 lg:p-8">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-600">{labels.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-brand-700">{labels.title}</h1>
        <p className="mt-2 max-w-xl text-sm text-slate-600">{labels.subtitle}</p>
      </header>

      <LeadsChart />
      <StatsBar />

      <section className="overflow-hidden rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/85 shadow-[0_18px_45px_rgba(6,44,73,0.06)]">
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
          <ul className="divide-y divide-[rgba(6,44,73,0.05)]">
            {recent.data.items.map((lead) => (
              <li key={lead.id}>
                <Link
                  href={`/leads/${lead.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-brand-50/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-brand-700">{lead.name}</span>
                      <span className="text-xs text-brand-700/50">· {lead.company ?? "—"}</span>
                    </div>
                    <div className="mt-1 text-xs text-brand-700/60">
                      {lead.phone ?? lead.email} · {formatDate(lead.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <UrgencyBadge urgency={lead.urgency} />
                    <StatusBadge status={lead.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
