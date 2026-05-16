"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/lib/types";

interface DailyPoint {
  date: string;
  count: number;
}

const STATUSES: Array<{ value: LeadStatus | ""; en: string; ru: string; dot: string }> = [
  { value: "", en: "All", ru: "Все", dot: "bg-brand-700" },
  { value: "NEW", en: "New", ru: "Новые", dot: "bg-blue-500" },
  { value: "IN_PROGRESS", en: "In progress", ru: "В работе", dot: "bg-amber-500" },
  { value: "PLANNED", en: "Planned", ru: "План", dot: "bg-emerald-500" },
  { value: "REJECTED", en: "Rejected", ru: "Отказ", dot: "bg-slate-500" },
  { value: "CONVERTED", en: "Converted", ru: "Продажи", dot: "bg-violet-500" },
];

export function LeadsChart({ days = 14 }: { days?: number }) {
  const { lang } = useLang();
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "">("");
  const [hover, setHover] = useState<{ idx: number; x: number; y: number } | null>(null);

  const query = useQuery({
    queryKey: ["leads-daily", days, statusFilter],
    queryFn: () =>
      api<DailyPoint[]>(`/leads/daily?days=${days}${statusFilter ? `&status=${statusFilter}` : ""}`),
    refetchInterval: 60_000,
  });

  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (pathRef.current) setPathLength(pathRef.current.getTotalLength());
    setAnimKey((k) => k + 1);
  }, [query.data, statusFilter]);

  const labels =
    lang === "ru"
      ? { title: "Заявки за период", subtitle: `Динамика последних ${days} дней`, total: "Всего", filter: "Фильтр" }
      : { title: "Leads over time", subtitle: `Last ${days} days`, total: "Total", filter: "Filter" };

  const data = query.data ?? [];
  const max = Math.max(2, ...data.map((d) => d.count));
  const total = data.reduce((s, d) => s + d.count, 0);

  const W = 800;
  const H = 220;
  const padX = 28;
  const padY = 26;
  const usableW = W - padX * 2;
  const usableH = H - padY * 2;

  const points = data.map((d, i) => {
    const x = padX + (i * usableW) / Math.max(1, data.length - 1);
    const y = padY + usableH - (d.count / max) * usableH;
    return { x, y, ...d };
  });

  const linePath = points.length
    ? points
        .map((p, i) => {
          if (i === 0) return `M ${p.x} ${p.y}`;
          const prev = points[i - 1];
          const cx = (prev.x + p.x) / 2;
          return `Q ${cx} ${prev.y} ${cx} ${(prev.y + p.y) / 2} T ${p.x} ${p.y}`;
        })
        .join(" ")
    : "";

  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x} ${H - padY} L ${points[0].x} ${H - padY} Z`
    : "";

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    if (points.length === 0) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      const d = Math.abs(points[i].x - px);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    setHover({ idx: best, x: points[best].x, y: points[best].y });
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/90 p-6 shadow-[0_18px_45px_rgba(6,44,73,0.08)] backdrop-blur-sm">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl brand-gradient text-white shadow-[0_10px_24px_rgba(5,54,92,0.25)]">
            <TrendingUp size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-brand-700">{labels.title}</h2>
            <p className="text-xs text-brand-700/60">{labels.subtitle}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-700/50">{labels.total}</div>
          <div className="text-3xl font-black tabular-nums text-brand-700">{total}</div>
        </div>
      </header>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {STATUSES.map((s) => {
          const active = statusFilter === s.value;
          return (
            <button
              key={s.value || "all"}
              type="button"
              onClick={() => setStatusFilter(s.value)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition",
                active
                  ? "bg-brand-700 text-white shadow-[0_8px_20px_rgba(5,54,92,0.25)]"
                  : "bg-white text-brand-700/70 ring-1 ring-[rgba(6,44,73,0.10)] hover:bg-brand-50 hover:text-brand-700",
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", s.dot, active && "ring-2 ring-white")} />
              {lang === "ru" ? s.ru : s.en}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-48 w-full sm:h-60"
          preserveAspectRatio="none"
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="chart-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2eb9c8" stopOpacity="0.45" />
              <stop offset="55%" stopColor="#2eb9c8" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#2eb9c8" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="chart-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#05365c" />
              <stop offset="50%" stopColor="#075b94" />
              <stop offset="100%" stopColor="#2eb9c8" />
            </linearGradient>
            <filter id="chart-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((g) => (
            <line
              key={g}
              x1={padX}
              x2={W - padX}
              y1={padY + usableH * g}
              y2={padY + usableH * g}
              stroke="rgba(6,44,73,0.05)"
              strokeWidth={1}
              strokeDasharray={g === 1 ? "" : "4 4"}
            />
          ))}

          {areaPath && <path d={areaPath} fill="url(#chart-area)" />}

          {linePath && (
            <path
              key={animKey}
              ref={pathRef}
              d={linePath}
              fill="none"
              stroke="url(#chart-line)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#chart-glow)"
              style={{
                strokeDasharray: pathLength || 2000,
                strokeDashoffset: pathLength || 2000,
                animation: pathLength ? "draw-line 1.4s ease-out forwards" : undefined,
              }}
            />
          )}

          {points.map((p, i) => (
            <g key={p.date + i}>
              <circle cx={p.x} cy={p.y} r={8} fill="#2eb9c8" fillOpacity="0.15" />
              <circle cx={p.x} cy={p.y} r={4} fill="#fff" stroke="#075b94" strokeWidth={2} />
            </g>
          ))}

          {hover && points[hover.idx] && (
            <g pointerEvents="none">
              <line
                x1={points[hover.idx].x}
                x2={points[hover.idx].x}
                y1={padY}
                y2={H - padY}
                stroke="rgba(6,44,73,0.20)"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <circle cx={points[hover.idx].x} cy={points[hover.idx].y} r={6} fill="#075b94" />
            </g>
          )}
        </svg>

        <style jsx>{`
          @keyframes draw-line {
            to {
              stroke-dashoffset: 0;
            }
          }
        `}</style>

        {hover && points[hover.idx] && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-xl bg-brand-700 px-3 py-2 text-xs font-bold text-white shadow-[0_10px_24px_rgba(5,54,92,0.30)]"
            style={{
              left: `${(points[hover.idx].x / W) * 100}%`,
              top: `${(points[hover.idx].y / H) * 100}%`,
            }}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-accent-400">
              {points[hover.idx].date}
            </div>
            <div className="text-base">{points[hover.idx].count}</div>
          </div>
        )}

        <div className="mt-3 flex justify-between text-[10px] font-bold uppercase tracking-wider text-brand-700/50">
          {points
            .filter((_, i) => i === 0 || i === Math.floor(points.length / 2) || i === points.length - 1)
            .map((p) => (
              <span key={p.date}>{p.date.slice(5)}</span>
            ))}
        </div>
      </div>
    </section>
  );
}
