"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Save } from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/lib/types";

const STATUSES: LeadStatus[] = ["NEW", "IN_PROGRESS", "PLANNED", "REJECTED", "CONVERTED"];

export function StatusSelect({ leadId, current }: { leadId: number; current: LeadStatus }) {
  const { t, lang } = useLang();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<LeadStatus>(current);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setDraft(current);
  }, [current]);

  const dirty = draft !== current;

  const mutation = useMutation({
    mutationFn: (status: LeadStatus) =>
      api(`/leads/${leadId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      setJustSaved(true);
      qc.invalidateQueries({ queryKey: ["lead", String(leadId)] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["leads-stats"] });
      setTimeout(() => setJustSaved(false), 1800);
    },
  });

  const saveLabel = lang === "ru" ? "Сохранить" : "Save";
  const savedLabel = lang === "ru" ? "Сохранено" : "Saved";

  return (
    <div className="flex items-center gap-2">
      <select
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value as LeadStatus);
          setJustSaved(false);
        }}
        disabled={mutation.isPending}
        className="h-10 rounded-full border border-[rgba(6,44,73,0.12)] bg-white px-4 text-sm font-bold text-brand-700 transition focus-visible:outline-none focus-visible:border-accent-500 focus-visible:ring-4 focus-visible:ring-accent-500/15 disabled:opacity-60"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {t(`status_${s}` as const)}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => mutation.mutate(draft)}
        disabled={!dirty || mutation.isPending}
        className={cn(
          "inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition",
          dirty
            ? "save-glow bg-accent-500 text-white hover:bg-accent-600"
            : justSaved
              ? "bg-emerald-500 text-white shadow-[0_10px_22px_rgba(16,185,129,0.30)]"
              : "cursor-not-allowed bg-slate-100 text-slate-400",
        )}
      >
        {justSaved ? (
          <>
            <Check size={14} />
            {savedLabel}
          </>
        ) : (
          <>
            <Save size={14} />
            {saveLabel}
          </>
        )}
      </button>
    </div>
  );
}
