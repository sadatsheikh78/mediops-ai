"use client";

import React, { useState, useEffect } from "react";
import { useSimulation, UserRole } from "@/context/SimulationContext";
import { Bell, Search, Server, ShieldCheck, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const {
    role,
    setRole,
    notifications,
    clearNotifications,
    markNotificationRead,
    isBackendConnected
  } = useSimulation();

  const [currentTime, setCurrentTime] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSelect, setShowRoleSelect] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        month: "short",
        day: "numeric"
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const roles: UserRole[] = ["Executive Director", "Chief Medical Officer", "Operations Manager"];

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setShowRoleSelect(false);
  };

  return (
    <header className="h-16 border-b border-slate-800 glass-panel fixed top-0 right-0 z-20 flex items-center justify-between px-6 transition-all duration-300" style={{ left: "var(--sidebar-width, 260px)" }}>
      {/* Search and Server State */}
      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search patients, resources, or anomalies..."
            className="h-9 w-80 bg-slate-900/60 border border-slate-800 rounded-lg pl-10 pr-4 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 transition font-medium"
          />
        </div>

        {/* Server status badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-800 bg-slate-950/40 text-[10px] font-semibold tracking-wider font-mono">
          <div className={`w-2 h-2 rounded-full ${isBackendConnected ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-cyan-500 shadow-[0_0_8px_#06b6d4] animate-pulse"}`} />
          <span className={isBackendConnected ? "text-green-400" : "text-cyan-400"}>
            {isBackendConnected ? "PROD LIVE" : "DEMO SIMULATOR"}
          </span>
        </div>
      </div>

      {/* Date, Time, Role Selector, Notifications */}
      <div className="flex items-center gap-6">
        {/* Time display */}
        <div className="text-right hidden lg:block">
          <span className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-widest">{currentTime}</span>
        </div>

        {/* Role Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSelect(!showRoleSelect)}
            className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_6px_#a855f7]" />
            <span className="text-slate-300 font-medium">View:</span>
            <span>{role}</span>
            <ChevronDown size={14} className="text-slate-500" />
          </button>

          <AnimatePresence>
            {showRoleSelect && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowRoleSelect(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-950 p-2 shadow-2xl z-50"
                >
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-500 tracking-wider font-mono uppercase mb-1">
                    Select Intelligence Persona
                  </div>
                  {roles.map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition ${
                        role === r
                          ? "bg-cyan-950/20 text-cyan-400 font-semibold"
                          : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                      }`}
                    >
                      <span>{r}</span>
                      {role === r && <Check size={14} className="text-cyan-400" />}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg border border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition relative"
          >
            <Bell size={16} className={unreadCount > 0 ? "animate-swing" : ""} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center shadow-lg shadow-red-500/30">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-800 bg-slate-950 p-2 shadow-2xl z-50 max-h-[400px] flex flex-col"
                >
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 mb-2">
                    <span className="text-xs font-semibold text-slate-200">Alert Notification Center</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-[10px] text-slate-500 hover:text-cyan-400 font-semibold uppercase tracking-wider"
                      >
                        Mark All Read
                      </button>
                    )}
                  </div>

                  <div className="overflow-y-auto flex-1 space-y-1 pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-500">
                        No new operational alerts.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-2.5 rounded-lg border cursor-pointer transition ${
                            n.read
                              ? "bg-transparent border-transparent text-slate-500"
                              : "bg-slate-900/60 border-slate-800 text-slate-200 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                              n.severity === "critical" ? "bg-red-500 shadow-[0_0_6px_#ef4444]" :
                              n.severity === "high" ? "bg-yellow-500 shadow-[0_0_6px_#f59e0b]" : "bg-cyan-500 shadow-[0_0_6px_#06b6d4]"
                            }`} />
                            <div className="flex-1">
                              <p className="text-xs font-medium leading-relaxed">{n.text}</p>
                              <span className="text-[9px] font-mono text-slate-500 mt-1 block">{n.time}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
