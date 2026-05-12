"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, FileText, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import type { PageSummary } from "@/lib/cms-types";
import { Button } from "@/components/button";

export function PagesList() {
  const { lang } = useLang();
  const query = useQuery({
    queryKey: ["pages"],
    queryFn: () => api<PageSummary[]>("/pages"),
  });

  const labels =
    lang === "ru"
      ? {
          eyebrow: "Контент сайта",
          title: "Страницы",
          subtitle: "Редактируйте блоки и тексты лендинга без программиста.",
          add: "Добавить страницу",
          blocks: "блоков",
          updated: "Обновлено",
          empty: "Пока нет ни одной страницы.",
          emptyHint: "Добавьте первую страницу, чтобы начать редактирование контента.",
          loading: "Загрузка…",
          error: "Не удалось загрузить страницы.",
        }
      : {
          eyebrow: "Site content",
          title: "Pages",
          subtitle: "Edit landing blocks and copy without touching code.",
          add: "Add page",
          blocks: "blocks",
          updated: "Updated",
          empty: "No pages yet.",
          emptyHint: "Add your first page to start editing site content.",
          loading: "Loading…",
          error: "Failed to load pages.",
        };

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-7 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-600">{labels.eyebrow}</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-brand-700">{labels.title}</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600">{labels.subtitle}</p>
        </div>
        <Button variant="accent" disabled>
          <Plus size={16} />
          {labels.add}
        </Button>
      </header>

      {query.isLoading && (
        <div className="rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/85 p-10 text-center text-brand-700/60">
          {labels.loading}
        </div>
      )}

      {query.isError && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center text-red-700">{labels.error}</div>
      )}

      {query.data && query.data.length === 0 && (
        <div className="rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/85 p-12 text-center shadow-[0_18px_45px_rgba(6,44,73,0.06)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <FileText size={26} />
          </div>
          <p className="text-base font-bold text-brand-700">{labels.empty}</p>
          <p className="mt-1 text-sm text-slate-500">{labels.emptyHint}</p>
        </div>
      )}

      {query.data && query.data.length > 0 && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {query.data.map((page) => (
            <Link
              key={page.id}
              href={`/pages/${page.slug}`}
              className="group relative overflow-hidden rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/85 p-6 shadow-[0_18px_45px_rgba(6,44,73,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(6,44,73,0.12)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-700 group-hover:text-white">
                  <FileText size={20} />
                </div>
                <ChevronRight size={20} className="text-brand-700/30 transition group-hover:translate-x-0.5 group-hover:text-brand-700" />
              </div>
              <h3 className="mt-4 text-xl font-black tracking-tight text-brand-700">{page.title}</h3>
              <p className="mt-1 text-xs font-mono text-brand-700/50">/{page.slug}</p>
              <div className="mt-5 flex items-center justify-between text-xs text-brand-700/60">
                <span className="font-medium">
                  <span className="font-bold text-brand-700">{page._count.blocks}</span> {labels.blocks}
                </span>
                <span>
                  {labels.updated}: {formatDate(page.updatedAt)}
                </span>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
