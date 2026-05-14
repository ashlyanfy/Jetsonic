"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { MobileTopbar } from "@/components/mobile-topbar";
import { DesktopTopbar } from "@/components/desktop-topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-h-screen flex-col lg:pl-64">
        <MobileTopbar onMenu={() => setOpen(true)} />
        <DesktopTopbar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
