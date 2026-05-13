"use client";

import { GlobalSearch } from "./global-search";

export function DesktopTopbar() {
  return (
    <header className="sticky top-0 z-20 hidden h-20 items-center gap-4 border-b border-[rgba(6,44,73,0.08)] bg-white/70 px-8 backdrop-blur-xl lg:flex">
      <div className="max-w-2xl flex-1">
        <GlobalSearch />
      </div>
    </header>
  );
}
