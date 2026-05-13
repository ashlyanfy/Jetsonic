"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import type { PageSummary } from "@/lib/cms-types";

export default function SeoListPage() {
  const { lang } = useLang();
  const query = useQuery({
    queryKey: ["pages"],
    queryFn: () => api<PageSummary[]>("/pages"),
  });

  const labels =
    lang === "ru"
      ? {
          eyebrow: "Поисковая оптимизация",
          title: "SEO",
          subtitle: "Заголовки, описания и ключевые слова для каждой страницы.",
          loading: "Загрузка…",
          error: "Не удалось загрузить страницы.",
          edit: "Редактировать",
        }
      : {
          eyebrow: "Search engine optimization",
          title: "SEO",
          subtitle: "Titles, descriptions and keywords for every page.",
          loading: "Loading…",
          error: "Failed to load pages.",
          edit: "Edit",
        };

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-7 p-4 sm:p-6 lg:p-8">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-600">{labels.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-brand-700">{labels.title}</h1>
        <p className="mt-2 max-w-xl text-sm text-slate-600">{labels.subtitle}</p>
      </header>

      {query.isLoading && (
        <div className="rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/85 p-10 text-center text-brand-700/60">
          {labels.loading}
        </div>
      )}

      {query.isError && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center text-red-700">{labels.error}</div>
      )}

      {query.data && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {query.data.map((page) => (
            <Link
              key={page.id}
              href={`/seo/${page.slug}`}
              className="group relative overflow-hidden rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/85 p-6 shadow-[0_18px_45px_rgba(6,44,73,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(6,44,73,0.12)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-600 transition group-hover:bg-accent-500 group-hover:text-white">
                  <Search size={20} />
                </div>
                <ChevronRight size={20} className="text-brand-700/30 transition group-hover:translate-x-0.5 group-hover:text-brand-700" />
              </div>
              <h3 className="mt-4 text-xl font-black tracking-tight text-brand-700">{page.title}</h3>
              <p className="mt-1 text-xs font-mono text-brand-700/50">/{page.slug}</p>
              <div className="mt-5 inline-flex h-7 items-center rounded-full bg-brand-50 px-2.5 text-[11px] font-bold uppercase tracking-wider text-brand-700">
                {labels.edit}
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
