"use client";

import React from "react";
import { useSimulation } from "@/context/SimulationContext";
import { Database, ShieldCheck, Box, RefreshCw, BarChart2 } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

export default function ResourcesPage() {
  const { resources, recommendations, approveRecommendation } = useSimulation();

  const inventoryRecs = recommendations.filter(
    (r) => r.status === "Pending" && (r.title.includes("Stock") || r.title.includes("Cleanup") || r.title.includes("ICU"))
  );

  // Oxygen depletion trend chart mock data
  const depletionData = [
    { date: "08:00", oxygen: 780, epinephrine: 480 },
    { date: "10:00", oxygen: 720, epinephrine: 470 },
    { date: "12:00", oxygen: 670, epinephrine: 460 },
    { date: "14:00", oxygen: 650, epinephrine: 440 },
    { date: "16:00", oxygen: 620, epinephrine: 420 },
    { date: "18:00", oxygen: 580, epinephrine: 380 },
    { date: "20:00", oxygen: 540, epinephrine: 350 }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-cyan-400 tracking-widest uppercase">Inventory logistics</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
            Resource Optimization Panel
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Auditing critical diagnostic assets, ICU bed pools, ventilators, and pharmaceutical inventories.
          </p>
        </div>
      </div>

      {/* Grid of resource meters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((res) => {
          const allocationRatio = res.allocated / res.total;
          const usagePercent = Math.round(allocationRatio * 100);
          
          let ringColor = "stroke-cyan-500";
          let textColor = "text-cyan-400";
          let bgBar = "bg-cyan-500";
          
          if (usagePercent > 90) {
            ringColor = "stroke-red-500";
            textColor = "text-red-400";
            bgBar = "bg-red-500";
          } else if (usagePercent > 75) {
            ringColor = "stroke-yellow-500";
            textColor = "text-yellow-400";
            bgBar = "bg-yellow-500";
          }

          return (
            <div
              key={res.id}
              className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4 hover:border-slate-700/60 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="block text-[10px] text-slate-500 font-bold font-mono uppercase">ID: {res.id}</span>
                  <h3 className="font-bold text-sm text-slate-200 mt-0.5">{res.name}</h3>
                </div>
                <Box className="text-slate-500" size={16} />
              </div>

              {/* Progress bar and numeric readout */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-400">
                    Allocated: <b className="text-slate-200">{res.allocated}</b> / {res.total} {res.unit}
                  </span>
                  <span className={`font-mono font-bold ${textColor}`}>{usagePercent}% Load</span>
                </div>

                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-900">
                  <div
                    className={`h-full transition-all duration-1000 ${bgBar}`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Depletion forecasts & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Depletion Rate chart */}
        <div className="lg:col-span-8 p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="text-cyan-400" size={16} />
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">
                Consumables Depletion Trends
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Live 24h Burn Rate</span>
          </div>

          <div className="h-64 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={depletionData}>
                <defs>
                  <linearGradient id="colorO2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b" }} />
                <Area type="monotone" dataKey="oxygen" name="Oxygen reserves" stroke="#3b82f6" fillOpacity={1} fill="url(#colorO2)" />
                <Area type="monotone" dataKey="epinephrine" name="Epinephrine stocks" stroke="#a855f7" fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource-specific recommendations */}
        <div className="lg:col-span-4 p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
          <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">
            Logistical Optimization
          </h3>

          <div className="space-y-3 overflow-y-auto max-h-[250px] pr-1">
            {inventoryRecs.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-900 text-center text-xs text-slate-500 space-y-2">
                <ShieldCheck size={24} className="text-green-500 mx-auto" />
                <p>Pharmacy stocks and bed capacities are running within target ranges.</p>
              </div>
            ) : (
              inventoryRecs.map((rec) => (
                <div key={rec.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[9px] font-bold text-yellow-400">
                    <span>{rec.priority} PRIORITY</span>
                    <span>{rec.confidence}% Conf.</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-300 leading-tight">{rec.title}</h4>
                    <p className="text-[10px] text-slate-500 leading-normal mt-0.5">{rec.description}</p>
                  </div>
                  <button
                    onClick={() => approveRecommendation(rec.id)}
                    className="w-full py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-[10px] font-bold text-white transition flex items-center justify-center gap-1"
                  >
                    <RefreshCw size={10} /> Approve Order
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
