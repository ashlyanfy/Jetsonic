"use client";

import { useQuery } from "@tanstack/react-query";
import { GlobalSearch } from "./global-search";
import { useLang } from "@/lib/i18n";
import { api } from "@/lib/api";
import type { Role } from "@/lib/types";

export function DesktopTopbar() {
  const { lang } = useLang();
  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => api<{ id: string; email: string; name: string; role: Role }>("/auth/me"),
    staleTime: 5 * 60_000,
  });
  const isAdmin = me.data?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-20 hidden h-20 items-center gap-6 border-b border-[rgba(6,44,73,0.08)] bg-white/70 px-8 backdrop-blur-xl lg:flex">
      <div className="max-w-2xl flex-1">
        <GlobalSearch />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="flex flex-col items-end">
          <img
            src="/assets/jetsonic_trade_logo.png"
            alt="Jetsonic logo"
            className="h-12 w-auto object-contain"
          />
          <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent-600">
            {lang === "ru" ? (isAdmin ? "Админ" : "Менеджер") : isAdmin ? "Admin" : "Manager"}
          </span>
        </div>
      </div>
    </header>
  );
}
