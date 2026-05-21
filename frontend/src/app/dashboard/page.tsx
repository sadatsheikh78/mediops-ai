"use client";

import React from "react";
import { useSimulation, KPICardData, SimulationState } from "@/context/SimulationContext";
import {
  Users,
  Award,
  DollarSign,
  Smile,
  Activity,
  RotateCcw,
  Zap,
  Heart,
  Clock,
  Bed,
  AlertTriangle,
  Shield,
  ArrowRight,
  TrendingUp,
  Brain,
  ShieldAlert
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

// Helper for Lucide icons mapping
const iconMap: { [key: string]: any } = {
  Users,
  Award,
  DollarSign,
  Smile,
  Activity,
  RotateCcw,
  Zap,
  Heart,
  Clock,
  Bed,
  AlertTriangle,
  Shield
};

export default function DashboardPage() {
  const {
    role,
    kpis,
    anomalies,
    auditLogs,
    resources,
    triggerManualSpike,
    approveRecommendation,
    recommendations,
    simulationState,
    setSimulationState,
    availableSimulationStates
  } = useSimulation();

  // Get active role KPIs
  const activeKpis = kpis[role] || [];

  // Data for charts
  const throughputData = [
    { hour: "08:00", actual: 120, forecast: 118 },
    { hour: "10:00", actual: 145, forecast: 135 },
    { hour: "12:00", actual: 168, forecast: 160 },
    { hour: "14:00", actual: 154, forecast: 158 },
    { hour: "16:00", actual: 178, forecast: 172 },
    { hour: "18:00", actual: null, forecast: 185 },
    { hour: "20:00", actual: null, forecast: 165 },
    { hour: "22:00", actual: null, forecast: 140 }
  ];

  const deptData = resources
    .filter((r) => r.category === "Beds" || r.category === "Staff")
    .map((r) => ({
      name: r.name,
      allocated: r.allocated,
      available: r.total - r.allocated,
      capacity: r.total
    }));

  const activeAnomalies = anomalies.filter((a) => a.status === "Active");
  const pendingRecs = recommendations.filter((r) => r.status === "Pending");

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner and Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-cyan-400 tracking-widest uppercase">Command intelligence</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4] animate-pulse" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
            {role === "Executive Director" && "Strategic Command Console"}
            {role === "Chief Medical Officer" && "Clinical Care Intelligence"}
            {role === "Operations Manager" && "Operational Flow Center"}
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            Welcome back, Administrator. Hospital operations are currently operating in{" "}
            <span className="text-cyan-400 font-semibold">{simulationState === "Normal Operations" ? "NOMINAL STATUS" : simulationState.toUpperCase()}</span>. 
            AI algorithms have processed recent admission flows and updated predictive recommendation lists.
          </p>
        </div>

        {/* Operations Simulation Engine Panel */}
        <div className="lg:col-span-5 p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3.5 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 tracking-wider font-mono uppercase">
              <Zap size={12} className="text-yellow-500 animate-pulse" /> Operations Simulation Engine
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-400 font-mono">
              <span className={`w-2 h-2 rounded-full ${simulationState === "Normal Operations" ? "bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" : "bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]"}`} />
              {simulationState.toUpperCase()}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[9px] font-extrabold text-slate-500 font-mono tracking-widest uppercase">SCENARIO INJECTION</div>
            <div className="grid grid-cols-3 gap-2">
              {availableSimulationStates.map((state) => {
                const colors: Record<SimulationState, { bg: string, border: string, text: string, hoverBg: string }> = {
                  "Normal Operations": { bg: "bg-emerald-950/20", border: "border-emerald-500/20", text: "text-emerald-400", hoverBg: "hover:bg-emerald-950/40" },
                  "Trauma ER Surge": { bg: "bg-red-950/20", border: "border-red-500/20", text: "text-red-400", hoverBg: "hover:bg-red-950/40" },
                  "ICU Saturation": { bg: "bg-purple-950/20", border: "border-purple-500/20", text: "text-purple-400", hoverBg: "hover:bg-purple-950/40" },
                  "Pandemic Load": { bg: "bg-orange-950/20", border: "border-orange-500/20", text: "text-orange-400", hoverBg: "hover:bg-orange-950/40" },
                  "Staffing Shortage": { bg: "bg-yellow-950/20", border: "border-yellow-500/20", text: "text-yellow-400", hoverBg: "hover:bg-yellow-950/40" },
                  "Resource Crisis": { bg: "bg-amber-950/20", border: "border-amber-500/20", text: "text-amber-400", hoverBg: "hover:bg-amber-950/40" },
                };
                
                const isActive = simulationState === state;
                const c = colors[state];
                
                return (
                  <button
                    key={state}
                    onClick={() => setSimulationState(state)}
                    className={`py-1.5 px-2 rounded-lg text-[9px] font-extrabold tracking-wide uppercase transition border ${c.hoverBg} ${
                      isActive 
                        ? `bg-slate-800 ${c.border.replace('/20', '/60')} ${c.text} shadow-[0_0_12px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30` 
                        : `${c.bg} ${c.border} ${c.text}`
                    }`}
                  >
                    {state.replace(" Operations", "")}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-1 border-t border-slate-800/60">
            <div className="text-[9px] font-extrabold text-slate-500 font-mono tracking-widest uppercase">TELEMETRY SPIKES</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => triggerManualSpike("ER_SURGE")}
                className="py-1 px-1.5 rounded bg-red-950/30 hover:bg-red-950/50 border border-red-500/30 text-[9px] font-bold text-red-400 transition animate-pulse"
              >
                ER Spike
              </button>
              <button
                onClick={() => triggerManualSpike("ICU_OVERLOAD")}
                className="py-1 px-1.5 rounded bg-purple-950/30 hover:bg-purple-950/50 border border-purple-500/30 text-[9px] font-bold text-purple-400 transition"
              >
                ICU Spike
              </button>
              <button
                onClick={() => triggerManualSpike("STAFF_SHORTAGE")}
                className="py-1 px-1.5 rounded bg-yellow-950/30 hover:bg-yellow-950/50 border border-yellow-500/30 text-[9px] font-bold text-yellow-400 transition"
              >
                Staff Spike
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {activeKpis.map((kpi, idx) => {
          const IconComponent = iconMap[kpi.icon] || Users;
          const borderGlow = 
            kpi.glowColor === "red" ? "hover:border-red-500/30 hover:shadow-red-950/5" :
            kpi.glowColor === "yellow" ? "hover:border-yellow-500/30 hover:shadow-yellow-950/5" :
            kpi.glowColor === "green" ? "hover:border-green-500/30 hover:shadow-green-950/5" :
            kpi.glowColor === "purple" ? "hover:border-purple-500/30 hover:shadow-purple-950/5" :
            "hover:border-cyan-500/30 hover:shadow-cyan-950/5";

          const textGlow = 
            kpi.glowColor === "red" ? "text-red-400" :
            kpi.glowColor === "yellow" ? "text-yellow-400" :
            kpi.glowColor === "green" ? "text-green-400" :
            kpi.glowColor === "purple" ? "text-purple-400" :
            "text-cyan-400";

          return (
            <div
              key={idx}
              className={`p-5 rounded-xl border border-slate-800 bg-slate-900/40 glass-panel-hover flex flex-col justify-between h-36 ${borderGlow}`}
            >
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase font-mono">{kpi.title}</span>
                <div className={`p-1.5 rounded-lg bg-slate-900 border border-slate-800 ${textGlow}`}>
                  <IconComponent size={14} />
                </div>
              </div>

              <div className="flex items-end justify-between mt-2">
                <div>
                  <span className="block text-2xl font-black tracking-tight text-slate-100">{kpi.value}</span>
                  <span className={`text-[10px] font-bold font-mono mt-0.5 inline-flex items-center gap-1 ${
                    kpi.trendDirection === "up" ? "text-green-400" : kpi.trendDirection === "down" ? "text-red-400" : "text-slate-400"
                  }`}>
                    {kpi.trendDirection === "up" ? "+" : ""}{kpi.trend}% vs base
                  </span>
                </div>

                {/* SVG Sparkline Mini Chart */}
                <div className="w-16 h-8">
                  <svg className="w-full h-full" viewBox="0 0 100 40">
                    <polyline
                      fill="none"
                      stroke={kpi.glowColor === "red" ? "#ef4444" : kpi.glowColor === "green" ? "#10b981" : "#06b6d4"}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={kpi.sparkline.map((val, i) => `${(i / (kpi.sparkline.length - 1)) * 100},${40 - ((val - Math.min(...kpi.sparkline)) / (Math.max(...kpi.sparkline) - Math.min(...kpi.sparkline) || 1)) * 30 - 5}`).join(" ")}
                    />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Throughput Area Chart */}
        <div className="lg:col-span-7 p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">Patient Admission Throughput</h3>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Real-time load compared with predictive 24h baseline models.</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold font-mono text-cyan-400">
              <TrendingUp size={12} /> Forecast Overlay Active
            </div>
          </div>

          <div className="h-64 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={throughputData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="hour" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", color: "#f8fafc" }}
                  itemStyle={{ color: "#06b6d4" }}
                />
                <Legend />
                <Area type="monotone" dataKey="actual" name="Actual Admissions" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" />
                <Area type="monotone" dataKey="forecast" name="AI Projected Inflow" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorForecast)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Congestion Bar Chart */}
        <div className="lg:col-span-5 p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">Departmental Resource Load</h3>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Allocation vs available reserve counts across active zones.</p>
            </div>
          </div>

          <div className="h-64 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} layout="vertical">
                <CartesianGrid stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis dataKey="name" type="category" stroke="#64748b" width={80} />
                <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b" }} />
                <Legend />
                <Bar dataKey="allocated" name="Allocated / In Use" stackId="a" fill="#3b82f6" barSize={12} />
                <Bar dataKey="available" name="Reserve Capacity" stackId="a" fill="#1e293b" stroke="#3b82f6" strokeWidth={0.5} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Decision Engine & Intelligence Feed Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Urgent Decision recommendations */}
        <div className="lg:col-span-6 p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="text-purple-400" size={16} />
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">Urgent Decision Recommendations</h3>
            </div>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-500/20">
              {pendingRecs.length} Actionable
            </span>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
            {pendingRecs.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500">
                All AI recommendations approved. No pending urgent items.
              </div>
            ) : (
              pendingRecs.map((rec) => (
                <div key={rec.id} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/[0.02] rounded-full blur-lg" />
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                      rec.priority === "Critical" ? "bg-red-950 text-red-400 border border-red-500/20" : "bg-purple-950 text-purple-400 border border-purple-500/20"
                    }`}>
                      {rec.priority}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-cyan-400">{rec.confidence}% AI Confidence</span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{rec.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{rec.description}</p>
                  </div>

                  <div className="text-[10px] text-slate-500">
                    <span className="font-semibold text-slate-400 font-mono">Explainable AI Drivers:</span> {rec.factors.join(", ")}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-900/60">
                    <button
                      onClick={() => approveRecommendation(rec.id)}
                      className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-[10px] font-bold text-white transition shadow-lg shadow-purple-600/20"
                    >
                      {rec.actionLabel}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Intelligence Feed */}
        <div className="lg:col-span-6 p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-cyan-400" size={16} />
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">Operational Intelligence Feed</h3>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 font-mono">
            {activeAnomalies.length === 0 && auditLogs.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500">
                Operational feed waiting for updates...
              </div>
            ) : (
              <div className="space-y-3 text-[11px]">
                {/* Active Anomaly Warnings first */}
                {activeAnomalies.map((anm) => (
                  <div key={anm.id} className="p-3 bg-red-950/15 border border-red-500/20 rounded-lg flex gap-3 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444] mt-1.5 flex-shrink-0 animate-ping" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-red-400 font-bold text-[10px]">
                        <span>[WARNING] ANOMALY FLAG ({anm.type})</span>
                        <span>{anm.timestamp}</span>
                      </div>
                      <p className="text-slate-300 mt-1 leading-relaxed">{anm.message}</p>
                    </div>
                  </div>
                ))}

                {/* Audit Logs */}
                {auditLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-lg flex gap-3 items-start text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold">
                        <span>[AUDIT] {log.action}</span>
                        <span>{log.timestamp}</span>
                      </div>
                      <p className="text-slate-300 mt-1 leading-relaxed">{log.details}</p>
                      <span className="text-[9px] font-semibold text-slate-500 mt-0.5 block">Triggered by: {log.userRole}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
