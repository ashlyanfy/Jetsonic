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
        className="flex h-10 w-13 items-center justify-center rounded-full border border-[rgba(6,44,73,0.10)] bg-white text-brand-700 hover:bg-brand-50"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>
      <div className="flex flex-1 flex-col items-center justify-center left-1/2">
        <img
          src="/assets/jetsonic_trade_logo.png"
          alt="Jetsonic logo"
          className="h-12 w-auto object-contain"
        />
      </div>
      <div className="w-10" />
    </header>
  );
}
