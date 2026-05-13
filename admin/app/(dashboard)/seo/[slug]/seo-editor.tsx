"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Search, Save } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import type { PageDetail } from "@/lib/cms-types";
import { Button } from "@/components/button";
import { Input } from "@/components/input";

interface SeoDraft {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
}

const EMPTY: SeoDraft = { title: "", description: "", keywords: "", ogImage: "" };

export function SeoEditor({ slug }: { slug: string }) {
  const { t, lang } = useLang();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<SeoDraft>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const pageQuery = useQuery({
    queryKey: ["page", slug],
    queryFn: () => api<PageDetail>(`/pages/${slug}`),
  });

  useEffect(() => {
    if (pageQuery.data?.seo) {
      setDraft({
        title: pageQuery.data.seo.title ?? "",
        description: pageQuery.data.seo.description ?? "",
        keywords: pageQuery.data.seo.keywords ?? "",
        ogImage: pageQuery.data.seo.ogImage ?? "",
      });
    } else if (pageQuery.data) {
      setDraft(EMPTY);
    }
  }, [pageQuery.data]);

  const save = useMutation({
    mutationFn: () =>
      api(`/pages/${slug}/seo`, {
        method: "POST",
        body: JSON.stringify({
          title: draft.title,
          description: draft.description,
          keywords: draft.keywords || undefined,
          ogImage: draft.ogImage || undefined,
        }),
      }),
    onSuccess: () => {
      setError(null);
      setSavedAt(new Date());
      qc.invalidateQueries({ queryKey: ["page", slug] });
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Failed to save");
    },
  });

  const labels =
    lang === "ru"
      ? {
          back: "SEO",
          eyebrow: "Настройки SEO страницы",
          previewTitle: "Превью результата в Google",
          previewUrl: "jetsonictrade.ae",
          loading: "Загрузка…",
          error: "Не удалось загрузить страницу.",
        }
      : {
          back: "SEO",
          eyebrow: "Page SEO settings",
          previewTitle: "Google preview",
          previewUrl: "jetsonictrade.ae",
          loading: "Loading…",
          error: "Failed to load page.",
        };

  if (pageQuery.isLoading)
    return <div className="mx-auto max-w-[1100px] p-8 text-brand-700/60">{labels.loading}</div>;
  if (pageQuery.isError || !pageQuery.data)
    return <div className="mx-auto max-w-[1100px] p-8 text-red-600">{labels.error}</div>;

  const page = pageQuery.data;
  const titleLen = draft.title.length;
  const descLen = draft.description.length;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    save.mutate();
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-7 p-4 sm:p-6 lg:p-8">
      <Link
        href="/seo"
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-700/60 transition hover:text-brand-700"
      >
        <ArrowLeft size={14} />
        {labels.back}
      </Link>

      <header className="overflow-hidden rounded-[28px] border border-[rgba(6,44,73,0.08)] bg-white/90 p-7 shadow-[0_28px_70px_rgba(6,44,73,0.10)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-600">{labels.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-700">{page.title}</h1>
        <p className="mt-1 text-sm font-mono text-brand-700/50">/{page.slug}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/85 p-6 shadow-[0_18px_45px_rgba(6,44,73,0.06)]"
        >
          <div className="space-y-5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wide text-brand-700">{t("seoTitle")}</label>
                <span className={`text-[11px] tabular-nums ${titleLen > 60 ? "text-red-600" : "text-brand-700/50"}`}>
                  {titleLen} / 60
                </span>
              </div>
              <Input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Jetsonic Trading FZCO | Aircraft Parts RFQ"
                maxLength={120}
              />
              <p className="text-xs text-brand-700/55">{t("seoTitleHint")}</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wide text-brand-700">
                  {t("seoDescription")}
                </label>
                <span className={`text-[11px] tabular-nums ${descLen > 160 ? "text-red-600" : "text-brand-700/50"}`}>
                  {descLen} / 160
                </span>
              </div>
              <textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={3}
                maxLength={320}
                placeholder="Dubai based aircraft parts sourcing, AOG support, RFQ intake…"
                className="w-full resize-y rounded-xl border border-[rgba(6,44,73,0.14)] bg-white/80 px-4 py-3 text-sm text-brand-900 placeholder:text-slate-400 transition focus-visible:outline-none focus-visible:border-accent-500 focus-visible:ring-4 focus-visible:ring-accent-500/15"
              />
              <p className="text-xs text-brand-700/55">{t("seoDescriptionHint")}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-brand-700">{t("seoKeywords")}</label>
              <Input
                value={draft.keywords}
                onChange={(e) => setDraft({ ...draft, keywords: e.target.value })}
                placeholder="aircraft parts, AOG, RFQ, FAA 8130-3, EASA Form 1"
              />
              <p className="text-xs text-brand-700/55">{t("seoKeywordsHint")}</p>
              {draft.keywords && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {draft.keywords
                    .split(",")
                    .map((k) => k.trim())
                    .filter(Boolean)
                    .map((k, i) => (
                      <span
                        key={`${k}-${i}`}
                        className="inline-flex h-6 items-center rounded-full bg-accent-500/10 px-2.5 text-[11px] font-bold text-accent-600"
                      >
                        {k}
                      </span>
                    ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-brand-700">{t("seoOgImage")}</label>
              <Input
                type="url"
                value={draft.ogImage}
                onChange={(e) => setDraft({ ...draft, ogImage: e.target.value })}
                placeholder="https://jetsonictrade.ae/assets/og-image.jpg"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between border-t border-[rgba(6,44,73,0.06)] pt-4">
              {savedAt && !save.isPending && (
                <span className="text-xs font-bold text-emerald-700">
                  ✓ {t("saved")} {savedAt.toLocaleTimeString()}
                </span>
              )}
              <Button type="submit" disabled={save.isPending} className="ml-auto">
                <Save size={14} />
                {save.isPending ? t("saving") : t("save")}
              </Button>
            </div>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/85 p-5 shadow-[0_18px_45px_rgba(6,44,73,0.06)]">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Search size={14} />
              </div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700/60">
                {labels.previewTitle}
              </h3>
            </div>

            <div className="rounded-2xl border border-[rgba(6,44,73,0.08)] bg-white p-4">
              <div className="text-xs text-[#202124]/70">
                {labels.previewUrl} <span className="text-[#202124]/40">›</span> {page.slug === "home" ? "" : page.slug}
              </div>
              <div className="mt-1 truncate text-lg text-[#1a0dab] hover:underline">
                {draft.title || page.title}
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-[#4d5156]">
                {draft.description || (lang === "ru" ? "Описание не задано." : "No description set.")}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
