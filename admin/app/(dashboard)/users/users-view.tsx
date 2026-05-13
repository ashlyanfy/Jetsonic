"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, ShieldCheck, User as UserIcon, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { formatDate, cn } from "@/lib/utils";
import type { Role } from "@/lib/types";
import type { AdminUser } from "@/lib/users-types";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Select } from "@/components/select";

interface UserDraft {
  id?: string;
  email: string;
  name: string;
  password: string;
  role: Role;
}

const EMPTY: UserDraft = { email: "", name: "", password: "", role: "MANAGER" };

export function UsersView() {
  const { t, lang } = useLang();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<UserDraft | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => api<AdminUser[]>("/users"),
  });

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: () => api<{ id: string; email: string; name: string; role: Role }>("/auth/me"),
  });

  const labels =
    lang === "ru"
      ? {
          eyebrow: "Команда",
          forbidden: "Только администратор может управлять пользователями.",
          empty: "Пользователей пока нет.",
          you: "Вы",
        }
      : {
          eyebrow: "Team",
          forbidden: "Only admins can manage users.",
          empty: "No users yet.",
          you: "You",
        };

  const save = useMutation({
    mutationFn: async (draft: UserDraft) => {
      if (draft.id) {
        const payload: { name: string; role: Role; password?: string } = { name: draft.name, role: draft.role };
        if (draft.password) payload.password = draft.password;
        return api(`/users/${draft.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      }
      return api("/users", {
        method: "POST",
        body: JSON.stringify({ email: draft.email, name: draft.name, role: draft.role, password: draft.password }),
      });
    },
    onSuccess: () => {
      setEditing(null);
      setFormError(null);
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : "Failed to save");
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/users/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  if (meQuery.data && meQuery.data.role !== "ADMIN") {
    return (
      <div className="mx-auto w-full max-w-[1100px] p-4 sm:p-6 lg:p-8">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
          <ShieldCheck size={28} className="mx-auto text-amber-700" />
          <p className="mt-3 text-base font-bold text-amber-900">{labels.forbidden}</p>
        </div>
      </div>
    );
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setFormError(null);
    save.mutate(editing);
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-7 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-600">{labels.eyebrow}</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-brand-700">{t("users")}</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600">{t("usersSubtitle")}</p>
        </div>
        <Button variant="accent" onClick={() => setEditing({ ...EMPTY })}>
          <Plus size={16} />
          {t("addUser")}
        </Button>
      </header>

      <section className="overflow-hidden rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/85 shadow-[0_18px_45px_rgba(6,44,73,0.06)]">
        {usersQuery.isLoading && <div className="p-10 text-center text-brand-700/60">{t("loading")}</div>}
        {usersQuery.isError && <div className="p-10 text-center text-red-600">{t("loadError")}</div>}

        {usersQuery.data && usersQuery.data.length === 0 && (
          <div className="p-12 text-center text-brand-700/60">{labels.empty}</div>
        )}

        {usersQuery.data && usersQuery.data.length > 0 && (
          <ul className="divide-y divide-[rgba(6,44,73,0.06)]">
            {usersQuery.data.map((user) => (
              <li key={user.id} className="flex flex-wrap items-center justify-between gap-3 p-5 transition hover:bg-brand-50/40">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black",
                      user.role === "ADMIN" ? "bg-brand-700 text-white" : "bg-brand-50 text-brand-700",
                    )}
                  >
                    {user.role === "ADMIN" ? <ShieldCheck size={18} /> : <UserIcon size={18} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-bold text-brand-700">{user.name || user.email}</span>
                      {meQuery.data?.id === user.id && (
                        <span className="inline-flex h-5 items-center rounded-full bg-accent-500/15 px-2 text-[10px] font-bold uppercase tracking-wider text-accent-600">
                          {labels.you}
                        </span>
                      )}
                      <span
                        className={cn(
                          "inline-flex h-5 items-center rounded-full px-2 text-[10px] font-bold uppercase tracking-wider",
                          user.role === "ADMIN" ? "bg-brand-700/10 text-brand-700" : "bg-slate-100 text-slate-600",
                        )}
                      >
                        {t(`role${user.role === "ADMIN" ? "Admin" : "Manager"}` as const)}
                      </span>
                    </div>
                    <div className="mt-0.5 truncate text-xs text-brand-700/60">
                      {user.email} · {formatDate(user.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEditing({ id: user.id, email: user.email, name: user.name, role: user.role, password: "" })
                    }
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[rgba(6,44,73,0.10)] bg-white px-3 text-xs font-bold text-brand-700 transition hover:border-brand-700/30 hover:bg-brand-50"
                  >
                    <Pencil size={12} />
                    {t("editUser")}
                  </button>
                  {meQuery.data?.id !== user.id && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(t("deleteConfirm"))) remove.mutate(user.id);
                      }}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 text-xs font-bold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={12} />
                      {t("deleteUser")}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/40 backdrop-blur-sm p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="w-full max-w-md rounded-[28px] border border-[rgba(6,44,73,0.08)] bg-white p-7 shadow-[0_28px_70px_rgba(6,44,73,0.20)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black tracking-tight text-brand-700">
                {editing.id ? t("editUser") : t("addUser")}
              </h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-brand-700/50 hover:bg-brand-50 hover:text-brand-700"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-brand-700">{t("email")}</label>
                <Input
                  type="email"
                  required
                  disabled={!!editing.id}
                  value={editing.email}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-brand-700">{t("name")}</label>
                <Input
                  required
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-brand-700">{t("role")}</label>
                <Select
                  value={editing.role}
                  onChange={(e) => setEditing({ ...editing, role: e.target.value as Role })}
                >
                  <option value="MANAGER">{t("roleManager")}</option>
                  <option value="ADMIN">{t("roleAdmin")}</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-brand-700">
                  {editing.id ? t("newPassword") : t("password")}
                </label>
                <Input
                  type="password"
                  required={!editing.id}
                  minLength={editing.id ? 0 : 8}
                  value={editing.password}
                  onChange={(e) => setEditing({ ...editing, password: e.target.value })}
                />
              </div>

              {formError && (
                <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                  {t("cancel")}
                </Button>
                <Button type="submit" disabled={save.isPending}>
                  {save.isPending ? t("saving") : t("save")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
