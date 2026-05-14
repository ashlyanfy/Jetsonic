"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Mail, Send, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";
import { Button } from "@/components/button";
import { Input } from "@/components/input";

type Channel = "off" | "email" | "telegram" | "both";

interface SettingsState {
  channel: Channel;
  emailTo: string;
  telegramChatId: string;
}

const STORAGE_KEY = "jetsonic_admin_notify_settings";

const DEFAULT: SettingsState = { channel: "off", emailTo: "", telegramChatId: "" };

export function SettingsView() {
  const { lang } = useLang();
  const qc = useQueryClient();
  const [state, setState] = useState<SettingsState>(DEFAULT);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => api<{ id: string; email: string; name: string; role: Role }>("/auth/me"),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setState({ ...DEFAULT, ...JSON.parse(raw) });
      } catch {
        /* ignore */
      }
    }
  }, []);

  const save = useMutation({
    mutationFn: async (next: SettingsState) => {
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    },
    onSuccess: () => {
      setSavedAt(new Date());
      qc.invalidateQueries({ queryKey: ["notify-settings"] });
      setTimeout(() => setSavedAt(null), 2000);
    },
  });

  const labels =
    lang === "ru"
      ? {
          eyebrow: "Настройки",
          title: "Уведомления",
          subtitle: "Куда отправлять оповещения о новых заявках.",
          forbidden: "Только администратор может менять настройки.",
          channel: "Канал доставки",
          channelOff: "Выключено",
          channelEmail: "Email",
          channelTelegram: "Telegram",
          channelBoth: "Email + Telegram",
          emailLabel: "Адрес для уведомлений",
          emailHint: "На этот email будут приходить новые заявки.",
          tgLabel: "Telegram chat ID",
          tgHint: "ID чата куда отправлять (например, ваш личный chat или групповой).",
          save: "Сохранить настройки",
          saved: "Сохранено локально",
          note:
            "Отправка пока работает в режиме черновика — настройки сохраняются в вашем браузере. Боевая отправка подключается отдельной итерацией (SMTP / Telegram Bot API).",
        }
      : {
          eyebrow: "Settings",
          title: "Notifications",
          subtitle: "Where to send alerts about new leads.",
          forbidden: "Only admins can change settings.",
          channel: "Delivery channel",
          channelOff: "Off",
          channelEmail: "Email",
          channelTelegram: "Telegram",
          channelBoth: "Email + Telegram",
          emailLabel: "Notification email",
          emailHint: "New leads will be delivered to this email.",
          tgLabel: "Telegram chat ID",
          tgHint: "Chat ID to deliver to (your personal chat or a group).",
          save: "Save settings",
          saved: "Saved locally",
          note:
            "Sending is in draft mode for now — settings are stored in your browser. Real delivery (SMTP / Telegram Bot API) ships in the next iteration.",
        };

  if (me.data && me.data.role !== "ADMIN") {
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
    save.mutate(state);
  }

  const channelOptions: Array<{ value: Channel; label: string; icon: typeof Mail }> = [
    { value: "off", label: labels.channelOff, icon: Bell },
    { value: "email", label: labels.channelEmail, icon: Mail },
    { value: "telegram", label: labels.channelTelegram, icon: Send },
    { value: "both", label: labels.channelBoth, icon: Bell },
  ];

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-7 p-4 sm:p-6 lg:p-8">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-600">{labels.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-brand-700">{labels.title}</h1>
        <p className="mt-2 max-w-xl text-sm text-slate-600">{labels.subtitle}</p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/90 p-6 shadow-[0_18px_45px_rgba(6,44,73,0.06)]"
      >
        <div>
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700/60">{labels.channel}</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {channelOptions.map((opt) => {
              const Icon = opt.icon;
              const active = state.channel === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setState({ ...state, channel: opt.value })}
                  className={cn(
                    "flex h-14 items-center gap-3 rounded-2xl border px-4 text-sm font-bold transition",
                    active
                      ? "border-accent-500 bg-accent-500/10 text-brand-700 shadow-[0_10px_24px_rgba(46,185,200,0.18)]"
                      : "border-[rgba(6,44,73,0.10)] bg-white text-brand-700/70 hover:border-brand-700/30 hover:bg-brand-50",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl",
                      active ? "bg-accent-500 text-white" : "bg-brand-50 text-brand-700",
                    )}
                  >
                    <Icon size={16} />
                  </div>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {(state.channel === "email" || state.channel === "both") && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-brand-700">{labels.emailLabel}</label>
            <Input
              type="email"
              value={state.emailTo}
              onChange={(e) => setState({ ...state, emailTo: e.target.value })}
              placeholder="manager@jetsonictrade.ae"
            />
            <p className="text-xs text-brand-700/55">{labels.emailHint}</p>
          </div>
        )}

        {(state.channel === "telegram" || state.channel === "both") && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-brand-700">{labels.tgLabel}</label>
            <Input
              value={state.telegramChatId}
              onChange={(e) => setState({ ...state, telegramChatId: e.target.value })}
              placeholder="123456789"
            />
            <p className="text-xs text-brand-700/55">{labels.tgHint}</p>
          </div>
        )}

        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          {labels.note}
        </p>

        <div className="flex items-center justify-between">
          {savedAt && <span className="text-xs font-bold text-emerald-700">✓ {labels.saved}</span>}
          <Button type="submit" disabled={save.isPending} className="ml-auto">
            {labels.save}
          </Button>
        </div>
      </form>
    </div>
  );
}
