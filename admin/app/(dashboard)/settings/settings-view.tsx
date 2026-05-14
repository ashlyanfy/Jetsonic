"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Bell, BellOff, Mail, Send, ShieldCheck, Smartphone, Check, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { disablePush, enablePush, getPushStatus, sendPushTest, type PushStatus } from "@/lib/push";
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
const DEFAULT: SettingsState = { channel: "telegram", emailTo: "", telegramChatId: "" };

export function SettingsView() {
  const { lang } = useLang();
  const [state, setState] = useState<SettingsState>(DEFAULT);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const [pushStatus, setPushStatus] = useState<PushStatus | "loading">("loading");
  const [pushBusy, setPushBusy] = useState(false);
  const [pushMessage, setPushMessage] = useState<string | null>(null);

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
    getPushStatus().then(setPushStatus).catch(() => setPushStatus("unsupported"));
  }, []);

  const save = useMutation({
    mutationFn: async (next: SettingsState) => {
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    },
    onSuccess: () => {
      setSavedAt(new Date());
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
          tgLabel: "Telegram chat ID",
          tgHint: "Чат куда отправлять сообщения. См. ниже как узнать chat ID.",
          tgHelp: "Чтобы узнать chat ID: открой Telegram → найди @jetsonic_trade_bot → нажми Start → отправь любое сообщение → этот ID показан на странице админ-бэкенда в логах.",
          save: "Сохранить настройки",
          saved: "Сохранено",
          note:
            "Логин для бота и chat ID должны быть прописаны в env-переменных Railway: TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID. После этого заявки начнут приходить в Telegram автоматически.",
          pushTitle: "Push-уведомления в браузер",
          pushSubtitle: "Получай оповещения о новых заявках прямо в этом устройстве, даже когда админка закрыта.",
          pushEnable: "Включить push",
          pushDisable: "Выключить",
          pushTest: "Отправить тестовое",
          pushStatusUnsupported: "Браузер не поддерживает push.",
          pushStatusDisabledServer: "Сервер не настроен (нет VAPID ключей).",
          pushStatusPermissionDenied: "Разрешение отозвано в настройках браузера.",
          pushStatusNotSubscribed: "Вы не подписаны.",
          pushStatusSubscribed: "Включено на этом устройстве.",
          testSent: "Тест отправлен.",
          working: "Работаем…",
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
          tgLabel: "Telegram chat ID",
          tgHint: "Chat where messages will be sent. See how to find the chat ID below.",
          tgHelp: "To get the chat ID: open Telegram → find @jetsonic_trade_bot → press Start → send any message → the chat ID will be shown in the admin backend logs.",
          save: "Save settings",
          saved: "Saved",
          note:
            "Bot token and chat ID must be set in Railway env: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID. After that, leads will be delivered to Telegram automatically.",
          pushTitle: "Browser push notifications",
          pushSubtitle: "Receive alerts on this device, even when the admin panel is closed.",
          pushEnable: "Enable push",
          pushDisable: "Disable",
          pushTest: "Send test",
          pushStatusUnsupported: "Browser does not support push.",
          pushStatusDisabledServer: "Server not configured (VAPID keys missing).",
          pushStatusPermissionDenied: "Permission denied in browser settings.",
          pushStatusNotSubscribed: "You are not subscribed.",
          pushStatusSubscribed: "Enabled on this device.",
          testSent: "Test sent.",
          working: "Working…",
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

  async function handleEnablePush() {
    setPushBusy(true);
    setPushMessage(null);
    try {
      const next = await enablePush();
      setPushStatus(next);
    } catch (e) {
      setPushMessage((e as Error).message);
    } finally {
      setPushBusy(false);
    }
  }

  async function handleDisablePush() {
    setPushBusy(true);
    try {
      const next = await disablePush();
      setPushStatus(next);
    } finally {
      setPushBusy(false);
    }
  }

  async function handleTestPush() {
    setPushBusy(true);
    setPushMessage(null);
    try {
      const res = await sendPushTest();
      setPushMessage(`${labels.testSent} (${res.sent})`);
    } catch (e) {
      setPushMessage((e as Error).message);
    } finally {
      setPushBusy(false);
    }
  }

  const pushStatusLabel = (() => {
    switch (pushStatus) {
      case "unsupported":
        return labels.pushStatusUnsupported;
      case "disabled-server":
        return labels.pushStatusDisabledServer;
      case "permission-denied":
        return labels.pushStatusPermissionDenied;
      case "not-subscribed":
        return labels.pushStatusNotSubscribed;
      case "subscribed":
        return labels.pushStatusSubscribed;
      default:
        return labels.working;
    }
  })();

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

      <section className="rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/90 p-6 shadow-[0_18px_45px_rgba(6,44,73,0.06)]">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-500/15 text-accent-600">
            <Smartphone size={18} />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight text-brand-700">{labels.pushTitle}</h2>
            <p className="text-xs text-brand-700/60">{labels.pushSubtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(6,44,73,0.08)] bg-brand-50/30 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-brand-700">
            {pushStatus === "subscribed" ? (
              <Check size={16} className="text-emerald-600" />
            ) : pushStatus === "unsupported" || pushStatus === "disabled-server" || pushStatus === "permission-denied" ? (
              <AlertCircle size={16} className="text-amber-600" />
            ) : (
              <BellOff size={16} className="text-brand-700/50" />
            )}
            {pushStatusLabel}
          </div>
          <div className="flex flex-wrap gap-2">
            {pushStatus === "not-subscribed" && (
              <Button onClick={handleEnablePush} disabled={pushBusy} variant="accent">
                <Bell size={14} />
                {pushBusy ? labels.working : labels.pushEnable}
              </Button>
            )}
            {pushStatus === "subscribed" && (
              <>
                <Button onClick={handleTestPush} disabled={pushBusy} variant="secondary" size="sm">
                  {labels.pushTest}
                </Button>
                <Button onClick={handleDisablePush} disabled={pushBusy} variant="ghost" size="sm">
                  <BellOff size={14} />
                  {labels.pushDisable}
                </Button>
              </>
            )}
          </div>
        </div>
        {pushMessage && (
          <p className="mt-3 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
            {pushMessage}
          </p>
        )}
      </section>

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
            <p className="rounded-2xl border border-accent-500/20 bg-accent-500/5 px-3.5 py-3 text-xs text-brand-700/80">
              {labels.tgHelp}
            </p>
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
