"use client";

import React, { useState } from "react";
import { useSimulation } from "@/context/SimulationContext";
import { Settings, ShieldAlert, FileText, Download, Check, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { auditLogs, role } = useSimulation();
  const [notifyLevel, setNotifyLevel] = useState("high");
  const [streamActive, setStreamActive] = useState(true);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold font-mono text-cyan-400 tracking-widest uppercase">System preferences</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
          Settings & Compliance Logs
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review operational trace logs, audit histories, and configuration flags.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings options */}
        <div className="lg:col-span-4 p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-6">
          <div className="flex items-center gap-2">
            <Settings className="text-cyan-400" size={16} />
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">Platform Controls</h3>
          </div>

          <div className="space-y-4 text-xs font-medium text-slate-300">
            <div className="space-y-2">
              <label className="block text-slate-500 uppercase tracking-wider text-[9px] font-bold">Default User Role (Active: {role})</label>
              <p className="text-[10px] text-slate-400 leading-normal">
                To toggle roles, use the view switcher in the header console. Role permissions are saved in compliance logs.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-500 uppercase tracking-wider text-[9px] font-bold">Alert Level Notification Threshold</label>
              <select
                value={notifyLevel}
                onChange={(e) => setNotifyLevel(e.target.value)}
                className="w-full h-9 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50"
              >
                <option value="all">All notifications (Verbose)</option>
                <option value="medium">Medium, High & Critical alerts</option>
                <option value="high">High & Critical alerts only (Default)</option>
                <option value="critical">Critical priority alerts only</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-b border-slate-900">
              <div>
                <span className="block text-slate-300 font-semibold">WebSockets Telemetry Stream</span>
                <span className="block text-[10px] text-slate-500 mt-0.5">Stream live hospital telemetry in background</span>
              </div>
              <button
                onClick={() => setStreamActive(!streamActive)}
                className={`w-10 h-6 rounded-full p-0.5 transition duration-200 focus:outline-none relative ${
                  streamActive ? "bg-cyan-500" : "bg-slate-800"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition duration-200 ${
                    streamActive ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Audit Log database board */}
        <div className="lg:col-span-8 p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText className="text-cyan-400" size={16} />
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">
                Clinical Compliance Audit Board
              </h3>
            </div>

            <button
              onClick={() => alert("Audit log data compiled and ready for PDF/JSON export.")}
              className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-300 transition flex items-center gap-1.5"
            >
              <Download size={12} /> Export CSV logs
            </button>
          </div>

          <div className="border border-slate-800 bg-slate-950/60 rounded-xl overflow-hidden font-mono text-xs">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-2 p-3 bg-slate-900/40 border-b border-slate-850 font-bold text-slate-500 text-[10px] uppercase">
              <div className="col-span-2">Timestamp</div>
              <div className="col-span-2">User Persona</div>
              <div className="col-span-3">Action Type</div>
              <div className="col-span-5">Audit Details</div>
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-[380px] divide-y divide-slate-900 pr-1">
              {auditLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  Compliance database empty. Launch recommendations to register audits.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="grid grid-cols-12 gap-2 p-3 items-start hover:bg-slate-900/10 transition">
                    <div className="col-span-2 text-slate-500 text-[10px] mt-0.5">{log.timestamp}</div>
                    <div className="col-span-2 text-slate-400 font-semibold">{log.userRole}</div>
                    <div className="col-span-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        log.action.includes("Approved") ? "bg-green-950 text-green-400 border border-green-500/20" :
                        log.action.includes("Dismissed") ? "bg-red-950 text-red-400" :
                        "bg-slate-900 text-slate-400"
                      }`}>
                        {log.action}
                      </span>
                    </div>
                    <div className="col-span-5 text-slate-300 text-[11px] leading-relaxed">{log.details}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
