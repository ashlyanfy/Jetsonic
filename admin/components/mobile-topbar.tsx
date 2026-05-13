"use client";

import { Menu } from "lucide-react";
import { useLang } from "@/lib/i18n";

export function MobileTopbar({ onMenu }: { onMenu: () => void }) {
  const { lang } = useLang();
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[rgba(6,44,73,0.08)] bg-white/85 px-4 backdrop-blur-xl lg:hidden">
      <button
        type="button"
        onClick={onMenu}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(6,44,73,0.10)] bg-white text-brand-700 hover:bg-brand-50"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center">
          <img
            src="/assets/jetsonic_trade_logo.png"
            alt="Jetsonic logo"
            className="h-10 w-auto rounded-2xl object-contain"
          />
          <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent-600">
            {lang === "ru" ? "Админ" : "Admin"}
          </span>
        </div>
      </div>
      <div className="w-10" />
    </header>
  );
}
