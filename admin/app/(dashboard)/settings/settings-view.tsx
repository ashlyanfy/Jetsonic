"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, Send, ShieldCheck, Smartphone, Check, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { disablePush, enablePush, getPushStatus, sendPushTest, type PushStatus } from "@/lib/push";
import type { Role } from "@/lib/types";
import { Button } from "@/components/button";
import { Input } from "@/components/input";

interface SettingsData {
  telegramChatId: string;
}

export function SettingsView() {
  const { lang } = useLang();
  const queryClient = useQueryClient();
  const [telegramChatId, setTelegramChatId] = useState("");
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const [pushStatus, setPushStatus] = useState<PushStatus | "loading">("loading");
  const [pushBusy, setPushBusy] = useState(false);
  const [pushMessage, setPushMessage] = useState<string | null>(null);

  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => api<{ id: string; email: string; name: string; role: Role }>("/auth/me"),
    staleTime: 5 * 60_000,
  });

  // Fetch current settings from backend
  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: () => api<SettingsData>("/settings"),
    enabled: me.data?.role === "ADMIN",
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setTelegramChatId(settingsQuery.data.telegramChatId ?? "");
    }
  }, [settingsQuery.data]);

  useEffect(() => {
    getPushStatus().then(setPushStatus).catch(() => setPushStatus("unsupported"));
  }, []);

  const save = useMutation({
    mutationFn: (chatId: string) =>
      api("/settings", { method: "PATCH", body: JSON.stringify({ telegramChatId: chatId }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setSavedAt(new Date());
      setTimeout(() => setSavedAt(null), 2500);
    },
  });

  const labels =
    lang === "ru"
      ? {
          eyebrow: "Настройки",
          title: "Уведомления",
          subtitle: "Настройте куда приходят оповещения о новых заявках.",
          forbidden: "Только администратор может менять настройки.",
          tgTitle: "Telegram уведомления",
          tgLabel: "ID чата Telegram",
          tgPlaceholder: "Напишите ID чтобы приходили заявки",
          tgHint: "Каждая новая заявка с сайта автоматически отправится в этот чат.",
          tgHelp:
            "Как узнать ID чата:\n1. Откройте Telegram и найдите бот @userinfobot\n2. Отправьте ему любое сообщение\n3. Бот ответит вашим числовым ID — скопируйте его сюда\n\nДля группового чата: добавьте @userinfobot в группу, он пришлёт ID группы (начинается с -)",
          save: "Сохранить",
          saved: "✓ Сохранено",
          saving: "Сохранение…",
          pushTitle: "Push-уведомления в браузере",
          pushSubtitle: "Всплывающее уведомление на этом устройстве при каждой новой заявке.",
          pushEnable: "Включить",
          pushDisable: "Выключить",
          pushTest: "Тест",
          pushStatusUnsupported: "Браузер не поддерживает push. Используйте Chrome или Edge.",
          pushStatusDisabledServer: "Push не настроен на сервере.",
          pushStatusPermissionDenied: "Уведомления заблокированы в браузере. Разрешите в настройках сайта.",
          pushStatusNotSubscribed: "Уведомления не подключены.",
          pushStatusSubscribed: "Уведомления включены на этом устройстве.",
          testSent: "Тест отправлен.",
          working: "Подождите…",
        }
      : {
          eyebrow: "Settings",
          title: "Notifications",
          subtitle: "Configure where new lead alerts are sent.",
          forbidden: "Only admins can change settings.",
          tgTitle: "Telegram notifications",
          tgLabel: "Telegram chat ID",
          tgPlaceholder: "Enter chat ID to receive leads",
          tgHint: "Every new lead from the website will be sent to this chat automatically.",
          tgHelp:
            "How to find your chat ID:\n1. Open Telegram and find @userinfobot\n2. Send it any message\n3. It will reply with your numeric ID — paste it here\n\nFor a group chat: add @userinfobot to the group, it will send the group ID (starts with -)",
          save: "Save",
          saved: "✓ Saved",
          saving: "Saving…",
          pushTitle: "Browser push notifications",
          pushSubtitle: "A popup on this device whenever a new lead comes in.",
          pushEnable: "Enable",
          pushDisable: "Disable",
          pushTest: "Test",
          pushStatusUnsupported: "Browser does not support push. Use Chrome or Edge.",
          pushStatusDisabledServer: "Push not configured on the server.",
          pushStatusPermissionDenied: "Notifications blocked in browser settings. Allow in site settings.",
          pushStatusNotSubscribed: "Not subscribed.",
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
    save.mutate(telegramChatId.trim());
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
      case "unsupported": return labels.pushStatusUnsupported;
      case "disabled-server": return labels.pushStatusDisabledServer;
      case "permission-denied": return labels.pushStatusPermissionDenied;
      case "not-subscribed": return labels.pushStatusNotSubscribed;
      case "subscribed": return labels.pushStatusSubscribed;
      default: return labels.working;
    }
  })();

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-7 p-4 sm:p-6 lg:p-8">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-600">{labels.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-brand-700">{labels.title}</h1>
        <p className="mt-2 max-w-xl text-sm text-slate-600">{labels.subtitle}</p>
      </header>

      {/* Telegram Settings */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/90 p-6 shadow-[0_18px_45px_rgba(6,44,73,0.06)]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-500/15 text-accent-600">
            <Send size={18} />
          </div>
          <h2 className="text-base font-black tracking-tight text-brand-700">{labels.tgTitle}</h2>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wide text-brand-700">{labels.tgLabel}</label>
          <Input
            value={settingsQuery.isLoading ? "" : telegramChatId}
            onChange={(e) => setTelegramChatId(e.target.value)}
            placeholder={settingsQuery.isLoading ? "…" : labels.tgPlaceholder}
            disabled={settingsQuery.isLoading}
          />
          <p className="text-xs text-brand-700/55">{labels.tgHint}</p>
        </div>

        <p className="whitespace-pre-line rounded-2xl border border-accent-500/20 bg-accent-500/5 px-3.5 py-3 text-xs leading-relaxed text-brand-700/80">
          {labels.tgHelp}
        </p>

        <div className="flex items-center justify-between">
          {savedAt && (
            <span className="text-xs font-bold text-emerald-700">{labels.saved}</span>
          )}
          {save.isError && (
            <span className="text-xs font-bold text-red-600">
              {lang === "ru" ? "Ошибка сохранения" : "Save failed"}
            </span>
          )}
          <Button type="submit" disabled={save.isPending || settingsQuery.isLoading} className="ml-auto">
            {save.isPending ? labels.saving : labels.save}
          </Button>
        </div>
      </form>

      {/* Push notifications */}
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
    </div>
  );
}
