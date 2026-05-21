"use client";

import React, { useState } from "react";
import { SimulationProvider } from "@/context/SimulationContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SimulationProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 cyber-grid relative">
        {/* Glowing Background Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none" />

        <Sidebar onCollapseToggle={(collapsed) => setIsCollapsed(collapsed)} />

        <div
          className="transition-all duration-300 min-h-screen flex flex-col"
          style={{
            paddingLeft: isCollapsed ? "72px" : "260px",
            "--sidebar-width": isCollapsed ? "72px" : "260px"
          } as React.CSSProperties}
        >
          <Header />
          
          <main className="flex-1 pt-20 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </SimulationProvider>
  );
}
