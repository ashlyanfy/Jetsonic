"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquarePlus, MessageSquare } from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import type { LeadNote } from "@/lib/types";
import { Button } from "./button";

interface NotesPanelProps {
  leadId: number;
  notes: LeadNote[];
}

export function NotesPanel({ leadId, notes }: NotesPanelProps) {
  const { lang } = useLang();
  const qc = useQueryClient();
  const [body, setBody] = useState("");

  const labels =
    lang === "ru"
      ? { title: "Заметки команды", placeholder: "Добавить заметку для команды…", add: "Добавить", empty: "Пока заметок нет." }
      : {
          title: "Team notes",
          placeholder: "Add an internal note for the team…",
          add: "Add note",
          empty: "No notes yet.",
        };

  const mutation = useMutation({
    mutationFn: (text: string) =>
      api<LeadNote>(`/leads/${leadId}/notes`, {
        method: "POST",
        body: JSON.stringify({ body: text }),
      }),
    onSuccess: () => {
      setBody("");
      qc.invalidateQueries({ queryKey: ["lead", String(leadId)] });
    },
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    mutation.mutate(trimmed);
  }

  return (
    <div className="rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/85 p-6 shadow-[0_18px_45px_rgba(6,44,73,0.06)] backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-600">
          <MessageSquare size={16} />
        </div>
        <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700/60">{labels.title}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={labels.placeholder}
          rows={3}
          className="w-full resize-y rounded-2xl border border-[rgba(6,44,73,0.14)] bg-white/80 px-4 py-3 text-sm text-brand-900 placeholder:text-slate-400 transition focus-visible:outline-none focus-visible:border-accent-500 focus-visible:ring-4 focus-visible:ring-accent-500/15"
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={mutation.isPending || !body.trim()} variant="accent">
            <MessageSquarePlus size={14} />
            {labels.add}
          </Button>
        </div>
      </form>

      <ul className="mt-6 space-y-3">
        {notes.length === 0 && <li className="text-sm text-slate-500">{labels.empty}</li>}
        {notes.map((note) => (
          <li key={note.id} className="rounded-2xl border border-[rgba(6,44,73,0.06)] bg-brand-50/40 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-brand-700">
                {note.author?.name ?? note.author?.email ?? "—"}
              </span>
              <span className="text-xs text-brand-700/50">{formatDate(note.createdAt)}</span>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-brand-900">{note.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
