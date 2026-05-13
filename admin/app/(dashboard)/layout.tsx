"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { MobileTopbar } from "@/components/mobile-topbar";
import { DesktopTopbar } from "@/components/desktop-topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopbar onMenu={() => setOpen(true)} />
        <DesktopTopbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
