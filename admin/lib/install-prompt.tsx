"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallPromptCtx {
  /** True when the browser exposed a real install prompt OR we detect iOS Safari. */
  canInstall: boolean;
  /** True when iOS — install requires manual "Share → Add to Home Screen". */
  isIos: boolean;
  /** True when already running as installed PWA. */
  isStandalone: boolean;
  /** Triggers the native prompt (Chrome/Edge/Android). No-op on iOS. */
  install: () => Promise<void>;
}

const InstallPromptContext = createContext<InstallPromptCtx | null>(null);

export function InstallPromptProvider({ children }: { children: ReactNode }) {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ua = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua);
    setIsIos(iOS);
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true,
    );

    function handler(e: Event) {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = useCallback(async () => {
    if (!event) return;
    try {
      await event.prompt();
      const choice = await event.userChoice;
      if (choice.outcome === "accepted") setEvent(null);
    } catch {
      /* user dismissed */
    }
  }, [event]);

  const canInstall = !isStandalone && (!!event || isIos);

  return (
    <InstallPromptContext.Provider value={{ canInstall, isIos, isStandalone, install }}>
      {children}
    </InstallPromptContext.Provider>
  );
}

export function useInstallPrompt() {
  const ctx = useContext(InstallPromptContext);
  if (!ctx) throw new Error("useInstallPrompt must be used within InstallPromptProvider");
  return ctx;
}
