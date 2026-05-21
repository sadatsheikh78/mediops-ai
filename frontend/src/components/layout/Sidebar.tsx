"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Activity,
  TrendingUp,
  Brain,
  BarChart3,
  ShieldAlert,
  Database,
  Network,
  Bot,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  onCollapseToggle?: (collapsed: boolean) => void;
}

export default function Sidebar({ onCollapseToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Monitoring", icon: Activity, path: "/dashboard/monitoring" },
    { name: "Forecasting", icon: TrendingUp, path: "/dashboard/forecasting" },
    { name: "Decision AI", icon: Brain, path: "/dashboard/decision-ai" },
    { name: "Analytics", icon: BarChart3, path: "/dashboard/analytics" },
    { name: "Anomaly Center", icon: ShieldAlert, path: "/dashboard/anomaly-center" },
    { name: "Resources", icon: Database, path: "/dashboard/resources" },
    { name: "Patient Flow", icon: Network, path: "/dashboard/patient-flow" },
    { name: "AI Assistant", icon: Bot, path: "/dashboard/ai-assistant" },
    { name: "Reports", icon: FileText, path: "/dashboard/reports" }
  ];

  const handleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    if (onCollapseToggle) {
      onCollapseToggle(nextState);
    }
  };

  return (
    <motion.div
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen glass-panel z-30 border-r border-slate-800 flex flex-col justify-between overflow-hidden"
    >
      {/* Brand Header */}
      <div>
        <div className="p-4 flex items-center justify-between border-b border-slate-800 h-16">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <span className="font-black text-white text-sm">M</span>
                </div>
                <div>
                  <span className="font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 text-sm">MEDIOPS AI</span>
                  <span className="block text-[8px] text-slate-500 tracking-widest -mt-1 font-mono uppercase">Decision Intel</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20"
              >
                <span className="font-black text-white text-sm">M</span>
              </motion.div>
            )}
          </AnimatePresence>

          {!isCollapsed && (
            <button
              onClick={handleCollapse}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== "/dashboard" && pathname?.startsWith(item.path));
            return (
              <Link key={item.name} href={item.path}>
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 group relative ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-950/40 to-slate-900 border-l-2 border-cyan-400 text-cyan-400 shadow-md shadow-cyan-950/20"
                      : "hover:bg-slate-900/60 text-slate-400 hover:text-slate-200 border-l-2 border-transparent"
                  }`}
                >
                  <item.icon
                    size={18}
                    className={`transition duration-200 ${
                      isActive ? "text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]" : "group-hover:text-slate-200"
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="font-medium text-sm transition-opacity duration-200">
                      {item.name}
                    </span>
                  )}
                  {/* Tooltip for collapsed sidebar */}
                  {isCollapsed && (
                    <div className="absolute left-16 bg-slate-900 border border-slate-800 text-slate-200 text-xs px-2 py-1 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50 shadow-xl">
                      {item.name}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <Link href="/dashboard/settings">
          <div
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
              pathname === "/dashboard/settings"
                ? "bg-slate-800 text-cyan-400 border-l-2 border-cyan-400"
                : "hover:bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Settings size={18} />
            {!isCollapsed && <span className="font-medium text-sm">Settings</span>}
          </div>
        </Link>

        {isCollapsed && (
          <button
            onClick={handleCollapse}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-900 text-slate-400 transition"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
