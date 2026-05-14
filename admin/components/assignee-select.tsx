"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import type { AdminUser } from "@/lib/users-types";

export function AssigneeSelect({ leadId, current }: { leadId: number; current: string | null }) {
  const { lang } = useLang();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<string>(current ?? "");

  const users = useQuery({
    queryKey: ["users-for-assign"],
    queryFn: () => api<AdminUser[]>("/users"),
    staleTime: 5 * 60_000,
  });

  const mutation = useMutation({
    mutationFn: (assigneeId: string) =>
      api(`/leads/${leadId}`, {
        method: "PATCH",
        body: JSON.stringify({ assigneeId: assigneeId || null }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lead", String(leadId)] });
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const label = lang === "ru" ? "Менеджер" : "Manager";
  const unassigned = lang === "ru" ? "Не назначен" : "Unassigned";

  function handleChange(value: string) {
    setDraft(value);
    mutation.mutate(value);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
        <UserCheck size={12} />
        {label}
      </span>
      <select
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
        disabled={mutation.isPending || users.isLoading}
        className="h-10 rounded-full border border-[rgba(6,44,73,0.12)] bg-white px-4 text-sm font-bold text-brand-700 transition focus-visible:outline-none focus-visible:border-accent-500 focus-visible:ring-4 focus-visible:ring-accent-500/15 disabled:opacity-60"
      >
        <option value="">— {unassigned} —</option>
        {users.data?.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name || u.email}
          </option>
        ))}
      </select>
    </div>
  );
}
