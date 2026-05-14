"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { MobileTopbar } from "@/components/mobile-topbar";
import { DesktopTopbar } from "@/components/desktop-topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="min-h-screen lg:ml-64">
        <MobileTopbar onMenu={() => setOpen(true)} />
        <DesktopTopbar />
        <main>{children}</main>
      </div>
    </div>
  );
}
