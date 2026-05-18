"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * Periodically pings the current HTML for an updated build ID and prompts
 * the installed PWA / open tab to reload when Next.js has shipped new code.
 *
 * Next.js sets a build identifier on each page render. We compare it to
 * the one we captured at mount; if it changes we surface a small banner.
 */
const CHECK_INTERVAL_MS = 60_000;
const ORIGIN_PATH = "/main";

function extractBuildId(html: string): string | null {
  const m =
    html.match(/"buildId"\s*:\s*"([^"]+)"/) ||
    html.match(/\/_next\/static\/([^/]+)\/_buildManifest/);
  return m ? m[1] : null;
}

export function AppVersionWatcher() {
  const { lang } = useLang();
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    let initial: string | null = null;
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch(`${ORIGIN_PATH}?_t=${Date.now()}`, {
          cache: "no-store",
          credentials: "same-origin",
        });
        if (!res.ok) return;
        const html = await res.text();
        const id = extractBuildId(html);
        if (!id) return;
        if (initial === null) {
          initial = id;
          return;
        }
        if (id !== initial && !cancelled) {
          setHasUpdate(true);
        }
      } catch {
        /* offline */
      }
    }

    void check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!hasUpdate) return null;

  const labels =
    lang === "ru"
      ? { title: "Доступно обновление", body: "Перезагрузите приложение, чтобы получить последнюю версию.", button: "Обновить" }
      : { title: "Update available", body: "Reload the app to load the latest version.", button: "Reload" };

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-accent-500/40 bg-white p-3.5 shadow-[0_18px_45px_rgba(6,44,73,0.20)] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-500/15 text-accent-600">
        <RefreshCw size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-brand-700">{labels.title}</p>
        <p className="text-xs text-brand-700/70">{labels.body}</p>
      </div>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-accent-500 px-3 text-xs font-bold text-white hover:bg-accent-600"
      >
        {labels.button}
      </button>
    </div>
  );
}
