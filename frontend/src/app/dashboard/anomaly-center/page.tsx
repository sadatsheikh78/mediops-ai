"use client";

import React from "react";
import { useSimulation } from "@/context/SimulationContext";
import { ShieldAlert, AlertTriangle, CheckCircle, Info, RefreshCcw } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

export default function AnomalyCenterPage() {
  const { anomalies, resolveAnomaly } = useSimulation();

  const active = anomalies.filter((a) => a.status === "Active");
  const resolved = anomalies.filter((a) => a.status === "Resolved");

  // Format dataset for anomalies by department/type
  const anomalyStats = [
    { type: "Billing Pattern", count: anomalies.filter(a => a.type === "Billing Pattern").length },
    { type: "Patient Surge", count: anomalies.filter(a => a.type === "Patient Surge").length },
    { type: "Staffing Deficit", count: anomalies.filter(a => a.type === "Staffing Deficit").length },
    { type: "ICU Overload", count: anomalies.filter(a => a.type === "ICU Overload").length },
    { type: "Wait Spikes", count: anomalies.filter(a => a.type === "Unusual Wait Spike").length }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-red-500 tracking-widest uppercase">Anomaly scanner</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-ping" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
            AI Anomaly Detection Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time pattern analysis scanning billing records, wait surges, and staffing inefficiencies.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Anomalies Alert Cards */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">
              Active Warnings ({active.length})
            </h3>
            <span className="text-[10px] font-mono text-red-400">
              Red Alert Threshold: Impact Score &gt; 70
            </span>
          </div>

          <div className="space-y-4">
            {active.length === 0 ? (
              <div className="p-8 rounded-xl border border-slate-800 bg-slate-900/10 text-center space-y-3">
                <CheckCircle size={32} className="text-green-500 mx-auto" />
                <p className="text-xs text-slate-400">No active anomalies detected in this block cycle.</p>
              </div>
            ) : (
              active.map((anm) => {
                const isCritical = anm.severity === "Critical";
                const borderStyle = isCritical
                  ? "border-red-500/30 bg-red-950/5 shadow-[0_0_15px_rgba(239,68,68,0.02)]"
                  : "border-yellow-500/20 bg-yellow-950/5";
                const badgeStyle = isCritical
                  ? "bg-red-950 text-red-400 border-red-500/30"
                  : "bg-yellow-950 text-yellow-400 border-yellow-500/30";
                
                return (
                  <div
                    key={anm.id}
                    className={`p-5 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 ${borderStyle}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 ${isCritical ? "text-red-500" : "text-yellow-500"}`}>
                        <ShieldAlert size={18} className={isCritical ? "animate-pulse" : ""} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${badgeStyle}`}>
                            {anm.severity}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">ID: {anm.id}</span>
                          <span className="text-[10px] font-mono text-slate-500">{anm.timestamp}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-200">{anm.type} Flagged</h4>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-xl">{anm.message}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 self-stretch md:self-auto justify-between md:justify-start border-t md:border-t-0 border-slate-900 pt-3 md:pt-0">
                      <div className="text-right">
                        <span className="block text-[10px] text-slate-500 font-mono">IMPACT SCORE</span>
                        <span className={`text-base font-black ${isCritical ? "text-red-500" : "text-yellow-500"}`}>
                          {anm.impactScore} / 100
                        </span>
                      </div>
                      <button
                        onClick={() => resolveAnomaly(anm.id)}
                        className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-300 transition"
                      >
                        Log Investigation
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Anomaly chart & audit logs */}
        <div className="lg:col-span-4 space-y-6">
          {/* Chart metrics */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">
              Incidents by Vector
            </h3>
            <div className="h-48 w-full text-[10px] font-mono">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={anomalyStats}>
                  <XAxis dataKey="type" stroke="#64748b" tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b" }} />
                  <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Resolved History */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">
              Resolved Timeline
            </h3>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 text-xs font-mono">
              {resolved.length === 0 ? (
                <div className="text-center py-6 text-slate-600">
                  No anomalies resolved in this block cycle.
                </div>
              ) : (
                resolved.map((anm) => (
                  <div key={anm.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between text-[9px] font-bold text-green-400">
                      <span>[RESOLVED] {anm.id}</span>
                      <span>Verified</span>
                    </div>
                    <p className="font-bold text-slate-300 text-[11px] leading-tight">{anm.type}</p>
                    <p className="text-[10px] text-slate-500">{anm.message}</p>
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
