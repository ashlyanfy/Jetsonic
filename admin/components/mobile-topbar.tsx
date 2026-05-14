"use client";

import { Menu } from "lucide-react";
import { GlobalSearch } from "./global-search";

export function MobileTopbar({ onMenu }: { onMenu: () => void }) {
  return (
    <div className="sticky top-0 z-20 border-b border-[rgba(6,44,73,0.08)] bg-white/85 backdrop-blur-xl lg:hidden">
      <header className="flex h-16 items-center justify-between px-4">
        <button
          type="button"
          onClick={onMenu}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(6,44,73,0.10)] bg-white text-brand-700 hover:bg-brand-50"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <div className="flex flex-1" />
        <img
          src="/assets/jetsonic_trade_logo.png"
          alt="Jetsonic logo"
          className="h-10 w-auto object-contain"
        />
      </header>

      <div className="border-t border-[rgba(6,44,73,0.06)] px-4 py-3">
        <GlobalSearch />
      </div>
    </div>
  );
}
