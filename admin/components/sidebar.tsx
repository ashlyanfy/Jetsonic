"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Inbox, LayoutGrid, Search, LogOut, X, Users as UsersIcon } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { api, clearToken } from "@/lib/api";
import { cn } from "@/lib/utils";
import { LangToggle } from "./lang-toggle";
import type { Role } from "@/lib/types";

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const { t, lang } = useLang();
  const pathname = usePathname();
  const router = useRouter();

  const cmsLabel = lang === "ru" ? "Контент сайта" : "Site content";
  const seoLabel = "SEO";

  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => api<{ id: string; email: string; name: string; role: Role }>("/auth/me"),
    staleTime: 5 * 60_000,
  });

  const nav = [
    { href: "/leads", label: t("navLeads"), icon: Inbox },
    { href: "/pages", label: cmsLabel, icon: LayoutGrid },
    { href: "/seo", label: seoLabel, icon: Search },
    ...(me.data?.role === "ADMIN" ? [{ href: "/users", label: t("users"), icon: UsersIcon }] : []),
  ];

  function handleLogout() {
    clearToken();
    router.push("/login");
    router.refresh();
  }

  function handleNav() {
    onClose?.();
  }

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-brand-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-[rgba(6,44,73,0.08)] bg-white/95 backdrop-blur-xl transition-transform duration-200 lg:static lg:translate-x-0 lg:bg-white/70",
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        <div className="flex h-20 items-center justify-between gap-3 border-b border-[rgba(6,44,73,0.08)] px-6">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <img
                src="/assets/jetsonic_trade_logo.png"
                alt="Jetsonic logo"
                className="h-10 w-auto rounded-2xl object-contain"
              />
              <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-accent-600">
                {lang === "ru" ? "Админ" : "Admin"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-brand-700/60 hover:bg-brand-50 hover:text-brand-700 lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNav}
                className={cn(
                  "group flex h-11 items-center gap-3 rounded-2xl px-4 text-sm font-bold transition",
                  active
                    ? "bg-brand-700 text-white shadow-[0_12px_28px_rgba(5,54,92,0.25)]"
                    : "text-brand-900/70 hover:bg-brand-50 hover:text-brand-700",
                )}
              >
                <Icon size={18} className={cn(active ? "text-accent-400" : "")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-[rgba(6,44,73,0.08)] p-3">
          <LangToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-11 w-full items-center gap-3 rounded-2xl px-4 text-sm font-bold text-brand-900/70 transition hover:bg-brand-50 hover:text-brand-700"
          >
            <LogOut size={18} />
            <span>{t("signOut")}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
