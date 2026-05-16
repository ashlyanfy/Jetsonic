"use client";

import { useState } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { useInstallPrompt } from "@/lib/install-prompt";
import { useLang } from "@/lib/i18n";
import { Button } from "./button";

/** Subtle banner — shown on the login page bottom. */
export function InstallHint() {
  const { lang } = useLang();
  const { canInstall, isIos, install } = useInstallPrompt();
  const [open, setOpen] = useState(true);

  if (!canInstall || !open) return null;

  const labels =
    lang === "ru"
      ? {
          title: "Установите Jetsonic Admin на устройство",
          hint: "Откройте админку как обычное приложение с домашнего экрана.",
          install: "Установить",
          iosHelp: "На iPhone: нажмите «Поделиться» → «На экран Домой».",
        }
      : {
          title: "Install Jetsonic Admin on this device",
          hint: "Open the admin like a regular app from your home screen.",
          install: "Install",
          iosHelp: "On iPhone: tap Share → Add to Home Screen.",
        };

  return (
    <div className="fixed inset-x-3 bottom-3 z-30 mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-[rgba(6,44,73,0.10)] bg-white/95 p-4 shadow-[0_18px_45px_rgba(6,44,73,0.20)] backdrop-blur sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-500/15 text-accent-600">
        <Smartphone size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-brand-700">{labels.title}</p>
        <p className="mt-0.5 text-xs text-brand-700/70">{isIos ? labels.iosHelp : labels.hint}</p>
        {!isIos && (
          <Button size="sm" variant="accent" className="mt-3" onClick={install}>
            <Download size={14} />
            {labels.install}
          </Button>
        )}
      </div>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-brand-700/50 hover:bg-brand-50 hover:text-brand-700"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}

/** Sidebar item — explicit "Install on home screen" button. */
export function InstallSidebarItem() {
  const { lang } = useLang();
  const { canInstall, isIos, install } = useInstallPrompt();
  const [showHelp, setShowHelp] = useState(false);

  if (!canInstall) return null;

  const label = lang === "ru" ? "Установить на устройство" : "Install on device";
  const iosHelp =
    lang === "ru"
      ? "На iPhone: нажмите «Поделиться» → «На экран Домой»."
      : "On iPhone: tap Share → Add to Home Screen.";

  return (
    <>
      <button
        type="button"
        onClick={() => (isIos ? setShowHelp((v) => !v) : install())}
        className="flex h-11 w-full items-center gap-3 rounded-2xl px-4 text-sm font-bold text-brand-900/70 transition hover:bg-brand-50 hover:text-brand-700"
      >
        <Smartphone size={18} />
        <span>{label}</span>
      </button>
      {showHelp && (
        <p className="mt-1 rounded-xl bg-accent-500/10 px-3 py-2 text-[11px] font-medium text-brand-700">
          {iosHelp}
        </p>
      )}
    </>
  );
}
