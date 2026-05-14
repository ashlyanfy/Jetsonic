"use client";

import Link from "next/link";
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

function lastNDaysRange(days: number) {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - (days - 1));
  return { from: start.toISOString().slice(0, 10), to: today.toISOString().slice(0, 10) };
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

  const last7 = lastNDaysRange(7);

  const cards = [
    {
      label: labels.new,
      value: data?.byStatus.NEW ?? 0,
      Icon: Inbox,
      accent: "from-brand-700 to-brand-600",
      iconBg: "bg-brand-50 text-brand-700",
      href: "/leads?status=NEW",
    },
    {
      label: labels.inProgress,
      value: data?.byStatus.IN_PROGRESS ?? 0,
      Icon: Loader2,
      accent: "from-amber-500 to-amber-400",
      iconBg: "bg-amber-50 text-amber-600",
      href: "/leads?status=IN_PROGRESS",
    },
    {
      label: labels.aog,
      value: data?.aog ?? 0,
      Icon: AlertOctagon,
      accent: "from-red-500 to-red-400",
      iconBg: "bg-red-50 text-red-600",
      href: "/leads?urgency=AOG",
    },
    {
      label: labels.last7,
      value: data?.last7 ?? 0,
      Icon: CalendarClock,
      accent: "from-accent-500 to-accent-400",
      iconBg: "bg-accent-500/10 text-accent-600",
      href: `/leads?from=${last7.from}&to=${last7.to}`,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Link
          key={c.label}
          href={c.href}
          className="group relative overflow-hidden rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/90 p-5 shadow-[0_18px_45px_rgba(6,44,73,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(6,44,73,0.12)]"
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
        </Link>
      ))}
    </section>
  );
}
