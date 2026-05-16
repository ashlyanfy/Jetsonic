"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Eye, EyeOff, ArrowUp, ArrowDown, Layers } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { PageBlock, PageDetail } from "@/lib/cms-types";
import { Button } from "@/components/button";
import { Input } from "@/components/input";

export function PageEditor({ slug }: { slug: string }) {
  const { lang } = useLang();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["page", slug],
    queryFn: () => api<PageDetail>(`/pages/${slug}`),
  });

  const labels =
    lang === "ru"
      ? {
          back: "Страницы",
          eyebrow: "Редактирование страницы",
          blocks: "Блоки",
          empty: "На этой странице ещё нет блоков.",
          enabled: "Включён",
          disabled: "Выключен",
          loading: "Загрузка…",
          error: "Не удалось загрузить страницу.",
          toggleShow: "Показать на сайте",
          toggleHide: "Скрыть с сайта",
          moveUp: "Вверх",
          moveDown: "Вниз",
          save: "Сохранить",
          unsaved: "Изменения не сохранены",
          saved: "Сохранено",
        }
      : {
          back: "Pages",
          eyebrow: "Page editor",
          blocks: "Blocks",
          empty: "This page has no blocks yet.",
          enabled: "Visible",
          disabled: "Hidden",
          loading: "Loading…",
          error: "Failed to load page.",
          toggleShow: "Show on site",
          toggleHide: "Hide from site",
          moveUp: "Move up",
          moveDown: "Move down",
          save: "Save",
          unsaved: "Unsaved changes",
          saved: "Saved",
        };

  const reorderMutation = useMutation({
    mutationFn: (orderedIds: number[]) =>
      api(`/pages/${slug}/blocks/reorder`, {
        method: "POST",
        body: JSON.stringify({ orderedIds }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["page", slug] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      api(`/pages/blocks/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ enabled }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["page", slug] }),
  });

  if (query.isLoading)
    return <div className="mx-auto max-w-[1100px] p-8 text-brand-700/60">{labels.loading}</div>;
  if (query.isError || !query.data)
    return <div className="mx-auto max-w-[1100px] p-8 text-red-600">{labels.error}</div>;

  const page = query.data;
  const blocks = page.blocks;

  function move(index: number, dir: -1 | 1) {
    const next = [...blocks];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    reorderMutation.mutate(next.map((b) => b.id));
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-7 p-4 sm:p-6 lg:p-8">
      <Link
        href="/pages"
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

      <section className="rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/85 p-6 shadow-[0_18px_45px_rgba(6,44,73,0.06)]">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <Layers size={16} />
          </div>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700/60">
            {labels.blocks} · {blocks.length}
          </h2>
        </div>

        {blocks.length === 0 && (
          <p className="rounded-2xl border border-[rgba(6,44,73,0.06)] bg-brand-50/30 p-6 text-center text-sm text-brand-700/60">
            {labels.empty}
          </p>
        )}

        <ul className="space-y-3">
          {blocks.map((block, index) => (
            <BlockRow
              key={block.id}
              block={block}
              labels={labels}
              isFirst={index === 0}
              isLast={index === blocks.length - 1}
              onMoveUp={() => move(index, -1)}
              onMoveDown={() => move(index, 1)}
              onToggle={() => toggleMutation.mutate({ id: block.id, enabled: !block.enabled })}
              slug={slug}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}

interface RowLabels {
  enabled: string;
  disabled: string;
  toggleShow: string;
  toggleHide: string;
  moveUp: string;
  moveDown: string;
  save: string;
  unsaved: string;
  saved: string;
}

function BlockRow({
  block,
  labels,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onToggle,
  slug,
}: {
  block: PageBlock;
  labels: RowLabels;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggle: () => void;
  slug: string;
}) {
  const qc = useQueryClient();
  const fields = extractEditableFields(block.data);
  const [draft, setDraft] = useState<Record<string, string>>(fields);
  const dirty = Object.keys(draft).some((k) => (draft[k] ?? "") !== (fields[k] ?? ""));

  const save = useMutation({
    mutationFn: (next: Record<string, string>) => {
      const merged = mergeFields(block.data, next);
      return api(`/pages/blocks/${block.id}`, {
        method: "PATCH",
        body: JSON.stringify({ data: merged }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["page", slug] }),
  });

  return (
    <li
      className={cn(
        "rounded-2xl border bg-white p-4 transition",
        block.enabled
          ? "border-[rgba(6,44,73,0.08)] shadow-[0_10px_30px_rgba(6,44,73,0.05)]"
          : "border-dashed border-[rgba(6,44,73,0.20)] bg-slate-50/60 opacity-80",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-7 items-center rounded-full bg-brand-50 px-2.5 text-[10px] font-black uppercase tracking-wider text-brand-700">
            {block.type}
          </span>
          <span
            className={cn(
              "inline-flex h-7 items-center rounded-full px-2.5 text-[10px] font-bold",
              block.enabled ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
            )}
          >
            {block.enabled ? labels.enabled : labels.disabled}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            title={labels.moveUp}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(6,44,73,0.10)] bg-white text-brand-700 transition hover:border-brand-700/30 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowUp size={14} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            title={labels.moveDown}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(6,44,73,0.10)] bg-white text-brand-700 transition hover:border-brand-700/30 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowDown size={14} />
          </button>
          <button
            type="button"
            onClick={onToggle}
            title={block.enabled ? labels.toggleHide : labels.toggleShow}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border transition",
              block.enabled
                ? "border-[rgba(6,44,73,0.10)] bg-white text-brand-700 hover:border-brand-700/30 hover:bg-brand-50"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
            )}
          >
            {block.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </div>
      </div>

      {Object.keys(fields).length > 0 && (
        <div className="mt-4 space-y-4">
          {groupFields(Object.entries(draft)).map((group) => (
            <FieldGroup
              key={group.title}
              title={group.title}
              entries={group.entries}
              onChange={(key, value) => setDraft({ ...draft, [key]: value })}
            />
          ))}
        </div>
      )}

      {(dirty || save.isPending) && (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[rgba(6,44,73,0.06)] pt-3">
          <span className={cn("text-xs font-bold", dirty ? "text-amber-700" : "text-emerald-700")}>
            {dirty ? labels.unsaved : labels.saved}
          </span>
          <Button size="sm" variant="accent" disabled={save.isPending || !dirty} onClick={() => save.mutate(draft)}>
            {labels.save}
          </Button>
        </div>
      )}
    </li>
  );
}

function extractEditableFields(data: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(data ?? {})) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

function mergeFields(original: Record<string, unknown>, edits: Record<string, string>) {
  const next: Record<string, unknown> = { ...original };
  for (const [key, value] of Object.entries(edits)) {
    next[key] = value;
  }
  return next;
}

/* ----- field grouping & nicer labels ----- */

interface FieldGroupData {
  title: string;
  entries: Array<[string, string]>;
}

function groupFields(entries: Array<[string, string]>): FieldGroupData[] {
  const groups = new Map<string, Array<[string, string]>>();
  for (const [key, value] of entries) {
    const m = key.match(/^(card|step|item|stat|meta|compare|check|route|orbit)_(\d{1,2})/i);
    let groupKey = "Section";
    if (m) {
      const cap = m[1].charAt(0).toUpperCase() + m[1].slice(1);
      groupKey = `${cap} ${parseInt(m[2], 10)}`;
    }
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey)!.push([key, value]);
  }
  const ordered: FieldGroupData[] = [];
  if (groups.has("Section")) ordered.push({ title: "Section", entries: groups.get("Section")! });
  for (const [title, e] of groups) if (title !== "Section") ordered.push({ title, entries: e });
  return ordered;
}

function humanLabel(key: string): string {
  const stripped = key.replace(/^(card|step|item|stat|meta|compare|check|route|orbit)_\d{1,2}_?/i, "");
  return (
    stripped
      .replace(/_/g, " ")
      .replace(/\b(en|ar|href|cta|desc|alt|url|p\/?n)\b/gi, (m) => m.toUpperCase())
      .replace(/^./, (c) => c.toUpperCase())
      .trim() || key
  );
}

function FieldGroup({
  title,
  entries,
  onChange,
}: {
  title: string;
  entries: Array<[string, string]>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="rounded-xl border border-[rgba(6,44,73,0.06)] bg-brand-50/30 p-4">
      <h3 className="mb-3 text-[11px] font-black uppercase tracking-[0.16em] text-brand-700">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {entries.map(([key, value]) => (
          <label key={key} className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-brand-700/60">
              {humanLabel(key)}
            </span>
            {value.length > 80 ? (
              <textarea
                value={value}
                onChange={(e) => onChange(key, e.target.value)}
                rows={3}
                className="w-full resize-y rounded-xl border border-[rgba(6,44,73,0.14)] bg-white px-3.5 py-2.5 text-sm text-brand-900 focus-visible:outline-none focus-visible:border-accent-500 focus-visible:ring-4 focus-visible:ring-accent-500/15"
              />
            ) : (
              <Input value={value} onChange={(e) => onChange(key, e.target.value)} />
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
