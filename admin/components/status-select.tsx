"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import type { LeadStatus } from "@/lib/types";

const STATUSES: LeadStatus[] = ["NEW", "IN_PROGRESS", "PLANNED", "REJECTED", "CONVERTED"];

export function StatusSelect({ leadId, current }: { leadId: number; current: LeadStatus }) {
  const { t } = useLang();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (status: LeadStatus) =>
      api(`/leads/${leadId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lead", String(leadId)] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["leads-stats"] });
    },
  });

  return (
    <select
      value={current}
      onChange={(e) => mutation.mutate(e.target.value as LeadStatus)}
      disabled={mutation.isPending}
      className="h-10 rounded-full border border-[rgba(6,44,73,0.12)] bg-white px-4 text-sm font-bold text-brand-700 transition focus-visible:outline-none focus-visible:border-accent-500 focus-visible:ring-4 focus-visible:ring-accent-500/15 disabled:opacity-60"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {t(`status_${s}` as const)}
        </option>
      ))}
    </select>
  );
}
