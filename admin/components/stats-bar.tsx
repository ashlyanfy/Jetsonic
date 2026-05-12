"use client";

import { useQuery } from "@tanstack/react-query";
import { Inbox, Loader2, AlertOctagon, CalendarClock } from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface StatsResponse {
  total: number;
  byStatus: Record<string, number>;
  aog: number;
  last7: number;
}

export function StatsBar() {
  const { lang } = useLang();
  const { data, isLoading } = useQuery({
    queryKey: ["leads-stats"],
    queryFn: () => api<StatsResponse>("/leads/stats"),
    refetchInterval: 30_000,
  });

  const labels =
    lang === "ru"
      ? { new: "Новых", inProgress: "В работе", aog: "AOG", last7: "За 7 дней" }
      : { new: "New", inProgress: "In progress", aog: "AOG", last7: "Last 7 days" };

  const cards = [
    {
      label: labels.new,
      value: data?.byStatus.NEW ?? 0,
      Icon: Inbox,
      accent: "from-brand-700 to-brand-600",
      iconBg: "bg-brand-50 text-brand-700",
    },
    {
      label: labels.inProgress,
      value: data?.byStatus.IN_PROGRESS ?? 0,
      Icon: Loader2,
      accent: "from-amber-500 to-amber-400",
      iconBg: "bg-amber-50 text-amber-600",
    },
    {
      label: labels.aog,
      value: data?.aog ?? 0,
      Icon: AlertOctagon,
      accent: "from-red-500 to-red-400",
      iconBg: "bg-red-50 text-red-600",
    },
    {
      label: labels.last7,
      value: data?.last7 ?? 0,
      Icon: CalendarClock,
      accent: "from-accent-500 to-accent-400",
      iconBg: "bg-accent-500/10 text-accent-600",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="relative overflow-hidden rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/85 p-5 shadow-[0_18px_45px_rgba(6,44,73,0.06)] transition hover:shadow-[0_22px_55px_rgba(6,44,73,0.10)]"
        >
          <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", c.accent)} />
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700/60">{c.label}</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-brand-700 tabular-nums">
                {isLoading ? "—" : c.value}
              </p>
            </div>
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", c.iconBg)}>
              <c.Icon size={22} />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
