"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2, X, Command, Inbox, LayoutGrid, Layers } from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Lead, LeadListResponse } from "@/lib/types";
import { StatusBadge, UrgencyBadge } from "./status-badge";

interface SearchPageResult {
  id: number;
  slug: string;
  title: string;
  _count: { blocks: number };
}

interface SearchBlockResult {
  id: number;
  type: string;
  pageSlug: string;
  pageTitle: string;
  matchKey: string;
  matchValue: string;
  enabled: boolean;
}

interface ContentSearchResponse {
  pages: SearchPageResult[];
  blocks: SearchBlockResult[];
}

export function GlobalSearch({ className }: { className?: string }) {
  const { lang } = useLang();
  const router = useRouter();
  const [value, setValue] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const labels =
    lang === "ru"
      ? {
          placeholder: "Поиск — заявки, страницы, блоки контента",
          empty: "Ничего не найдено.",
          all: "Все результаты заявок",
          searching: "Поиск…",
          leads: "Заявки",
          pages: "Страницы",
          blocks: "Блоки",
          edit: "Редактировать",
        }
      : {
          placeholder: "Search — leads, pages, content blocks",
          empty: "Nothing found.",
          all: "All lead results",
          searching: "Searching…",
          leads: "Leads",
          pages: "Pages",
          blocks: "Blocks",
          edit: "Edit",
        };

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value.trim()), 300);
    return () => clearTimeout(t);
  }, [value]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const input = wrapperRef.current?.querySelector("input");
        input?.focus();
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const leadsQuery = useQuery({
    queryKey: ["global-search-leads", debounced],
    queryFn: () => api<LeadListResponse>("/leads", { query: { q: debounced, page: 1, pageSize: 5 } }),
    enabled: debounced.length >= 2,
    staleTime: 30_000,
  });

  const contentQuery = useQuery({
    queryKey: ["global-search-content", debounced],
    queryFn: () => api<ContentSearchResponse>("/pages/search", { query: { q: debounced } }),
    enabled: debounced.length >= 2,
    staleTime: 30_000,
  });

  function closeAndNavigate(href: string) {
    setOpen(false);
    setValue("");
    router.push(href);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!debounced) return;
    closeAndNavigate(`/leads?q=${encodeURIComponent(debounced)}`);
  }

  const loading = leadsQuery.isLoading || contentQuery.isLoading;
  const leads = leadsQuery.data?.items ?? [];
  const pages = contentQuery.data?.pages ?? [];
  const blocks = contentQuery.data?.blocks ?? [];
  const nothing = !loading && leads.length === 0 && pages.length === 0 && blocks.length === 0;

  return (
    <div ref={wrapperRef} className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit}>
        <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-700/40" />
        <input
          type="search"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={labels.placeholder}
          className="h-11 w-full rounded-full border border-[rgba(6,44,73,0.12)] bg-white/90 pl-11 pr-24 text-sm text-brand-900 placeholder:text-brand-700/40 transition focus-visible:outline-none focus-visible:border-accent-500 focus-visible:ring-4 focus-visible:ring-accent-500/15"
          aria-label={labels.placeholder}
        />
        <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-700/40 sm:flex">
          <kbd className="inline-flex h-5 items-center gap-0.5 rounded border border-[rgba(6,44,73,0.12)] bg-white px-1.5">
            <Command size={10} /> K
          </kbd>
        </div>
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue("");
              setOpen(false);
            }}
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-brand-700/50 hover:bg-brand-50 hover:text-brand-700 sm:hidden"
            aria-label="Clear"
          >
            <X size={14} />
          </button>
        )}
      </form>

      {open && debounced.length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-[rgba(6,44,73,0.10)] bg-white/95 shadow-[0_24px_60px_rgba(6,44,73,0.18)] backdrop-blur-xl">
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-brand-700/60">
              <Loader2 size={14} className="animate-spin" />
              {labels.searching}
            </div>
          )}

          {nothing && <div className="px-4 py-6 text-center text-sm text-brand-700/60">{labels.empty}</div>}

          <div className="max-h-[70vh] overflow-y-auto">
            {leads.length > 0 && (
              <ResultSection icon={<Inbox size={12} />} title={labels.leads}>
                {leads.map((lead) => (
                  <LeadRow key={lead.id} lead={lead} onClick={() => closeAndNavigate(`/leads/${lead.id}`)} />
                ))}
              </ResultSection>
            )}

            {pages.length > 0 && (
              <ResultSection icon={<LayoutGrid size={12} />} title={labels.pages}>
                {pages.map((page) => (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => closeAndNavigate(`/pages/${page.slug}`)}
                    className="flex w-full items-center justify-between gap-3 border-b border-[rgba(6,44,73,0.05)] px-4 py-3 text-left transition last:border-0 hover:bg-brand-50/60"
                  >
                    <div>
                      <div className="text-sm font-bold text-brand-700">{page.title}</div>
                      <div className="font-mono text-xs text-brand-700/50">/{page.slug}</div>
                    </div>
                    <span className="text-xs text-brand-700/60">
                      {page._count.blocks} {labels.blocks.toLowerCase()}
                    </span>
                  </button>
                ))}
              </ResultSection>
            )}

            {blocks.length > 0 && (
              <ResultSection icon={<Layers size={12} />} title={labels.blocks}>
                {blocks.map((block) => (
                  <button
                    key={block.id}
                    type="button"
                    onClick={() => closeAndNavigate(`/pages/${block.pageSlug}`)}
                    className="flex w-full items-start gap-3 border-b border-[rgba(6,44,73,0.05)] px-4 py-3 text-left transition last:border-0 hover:bg-brand-50/60"
                  >
                    <span className="inline-flex h-6 items-center rounded-full bg-brand-50 px-2 text-[10px] font-black uppercase tracking-wider text-brand-700">
                      {block.type}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-brand-700">{block.pageTitle}</div>
                      <div className="mt-0.5 truncate text-xs text-brand-700/70">
                        <span className="font-mono text-brand-700/50">{block.matchKey}:</span> {block.matchValue}
                      </div>
                    </div>
                  </button>
                ))}
              </ResultSection>
            )}
          </div>

          {leads.length > 0 && (
            <div className="border-t border-[rgba(6,44,73,0.06)] bg-brand-50/40 px-4 py-2.5 text-right text-xs">
              <button
                type="button"
                onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
                className="font-bold text-brand-700 hover:underline"
              >
                {labels.all} →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-1.5 border-b border-[rgba(6,44,73,0.05)] bg-brand-50/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
        {icon}
        {title}
      </div>
      <ul>{children}</ul>
    </section>
  );
}

function LeadRow({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-start gap-3 border-b border-[rgba(6,44,73,0.05)] px-4 py-3 text-left transition last:border-0 hover:bg-brand-50/60"
      >
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-black text-brand-700">
          {(lead.name?.[0] ?? "?").toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-bold text-brand-700">{lead.name}</span>
            <span className="shrink-0 text-[11px] text-brand-700/50">{formatDate(lead.createdAt)}</span>
          </div>
          <div className="mt-0.5 truncate text-xs text-brand-700/70">
            {lead.company ?? "—"} · {lead.phone ?? lead.email}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <UrgencyBadge urgency={lead.urgency} />
            <StatusBadge status={lead.status} />
          </div>
        </div>
      </button>
    </li>
  );
}
