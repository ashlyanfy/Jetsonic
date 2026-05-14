"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";

interface DailyPoint {
  date: string;
  count: number;
}

export function LeadsChart({ days = 14 }: { days?: number }) {
  const { lang } = useLang();
  const query = useQuery({
    queryKey: ["leads-daily", days],
    queryFn: () => api<DailyPoint[]>(`/leads/daily?days=${days}`),
    refetchInterval: 60_000,
  });

  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      setPathLength(len);
    }
  }, [query.data]);

  const labels =
    lang === "ru"
      ? { title: "Заявки за период", subtitle: `Динамика последних ${days} дней`, total: "Всего" }
      : { title: "Leads over time", subtitle: `Last ${days} days`, total: "Total" };

  const data = query.data ?? [];
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((s, d) => s + d.count, 0);

  const W = 800;
  const H = 200;
  const padX = 24;
  const padY = 24;
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
          return `Q ${cx} ${prev.y} ${p.x} ${p.y}`;
        })
        .join(" ")
    : "";

  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x} ${H - padY} L ${points[0].x} ${H - padY} Z`
    : "";

  return (
    <section className="overflow-hidden rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/85 p-6 shadow-[0_18px_45px_rgba(6,44,73,0.06)] backdrop-blur-sm">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-600">
            <TrendingUp size={18} />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight text-brand-700">{labels.title}</h2>
            <p className="text-xs text-brand-700/60">{labels.subtitle}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700/60">{labels.total}</div>
          <div className="text-2xl font-black tabular-nums text-brand-700">{total}</div>
        </div>
      </header>

      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full sm:h-56" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chart-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2eb9c8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#2eb9c8" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="chart-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#075b94" />
              <stop offset="100%" stopColor="#2eb9c8" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((g) => (
            <line
              key={g}
              x1={padX}
              x2={W - padX}
              y1={padY + usableH * g}
              y2={padY + usableH * g}
              stroke="rgba(6,44,73,0.06)"
              strokeWidth={1}
            />
          ))}

          {areaPath && <path d={areaPath} fill="url(#chart-area)" />}

          {linePath && (
            <path
              ref={pathRef}
              d={linePath}
              fill="none"
              stroke="url(#chart-line)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: pathLength || 1000,
                strokeDashoffset: pathLength || 1000,
                animation: pathLength ? "draw-line 1.6s ease-out forwards" : undefined,
              }}
            />
          )}

          {points.map((p) => (
            <g key={p.date}>
              <circle cx={p.x} cy={p.y} r={3.5} fill="#075b94" />
              <circle cx={p.x} cy={p.y} r={6} fill="#2eb9c8" fillOpacity="0.25" />
            </g>
          ))}
        </svg>

        <style jsx>{`
          @keyframes draw-line {
            to {
              stroke-dashoffset: 0;
            }
          }
        `}</style>

        <div className="mt-2 flex justify-between text-[10px] font-medium text-brand-700/50">
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
