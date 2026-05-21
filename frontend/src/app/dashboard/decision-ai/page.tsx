"use client";

import React from "react";
import { useSimulation } from "@/context/SimulationContext";
import { Brain, ShieldCheck, AlertTriangle, CheckCircle, RefreshCw, Eye, ThumbsUp, Trash2 } from "lucide-react";

export default function DecisionAIPage() {
  const {
    recommendations,
    approveRecommendation,
    dismissRecommendation,
    auditLogs
  } = useSimulation();

  const pending = recommendations.filter((r) => r.status === "Pending");
  const approved = recommendations.filter((r) => r.status === "Approved");

  // Calculate global operational risk index
  const riskIndex = pending.reduce((acc, curr) => {
    if (curr.priority === "Critical") return acc + 25;
    if (curr.priority === "High") return acc + 15;
    return acc + 5;
  }, 35); // base risk is 35

  const boundedRisk = Math.min(riskIndex, 100);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-cyan-400 tracking-widest uppercase">Decision analytics</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
            Decision Intelligence Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Explainable AI prescribing real-time operational maneuvers to optimize throughput.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Recommendations Feed */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">
              Pending Prescriptions
            </h3>
            <span className="text-[10px] font-mono text-cyan-400">
              {pending.length} Recommendations Awaiting Action
            </span>
          </div>

          <div className="space-y-6">
            {pending.length === 0 ? (
              <div className="p-8 rounded-xl border border-slate-800 bg-slate-900/10 text-center space-y-3">
                <ShieldCheck size={32} className="text-green-500 mx-auto" />
                <p className="text-xs text-slate-400">All operational suggestions have been processed.</p>
              </div>
            ) : (
              pending.map((rec) => (
                <div
                  key={rec.id}
                  className={`p-6 rounded-xl border bg-slate-900/35 relative overflow-hidden space-y-4 ${
                    rec.priority === "Critical"
                      ? "border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.02)]"
                      : "border-slate-800"
                  }`}
                >
                  {/* Subtle neon glowing badge depending on priority */}
                  {rec.priority === "Critical" && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        rec.priority === "Critical" ? "bg-red-950 text-red-400 border border-red-500/30" :
                        rec.priority === "High" ? "bg-yellow-950 text-yellow-400 border border-yellow-500/30" :
                        "bg-cyan-950 text-cyan-400 border border-cyan-500/30"
                      }`}>
                        {rec.priority} PRIORITY
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">ID: {rec.id}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-cyan-400">{rec.confidence}% AI Confidence</span>
                      <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-500 h-full" style={{ width: `${rec.confidence}%` }} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-slate-200">{rec.title}</h2>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{rec.description}</p>
                  </div>

                  {/* Explainable AI block */}
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-900 space-y-3">
                    <div>
                      <span className="block text-[9px] font-black text-slate-500 tracking-widest uppercase font-mono">
                        Explainable Contributing Factors
                      </span>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {rec.factors.map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-slate-400 leading-normal">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 flex-shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-slate-900">
                      <span className="block text-[9px] font-black text-slate-500 tracking-widest uppercase font-mono">
                        Operational Impact Explanation
                      </span>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {rec.operationalImpact}
                      </p>
                    </div>
                  </div>

                  {/* Action controls */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => dismissRecommendation(rec.id)}
                      className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-400 hover:text-slate-300 transition"
                    >
                      Dismiss Suggestion
                    </button>
                    <button
                      onClick={() => approveRecommendation(rec.id)}
                      className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white transition shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
                    >
                      <ThumbsUp size={12} /> {rec.actionLabel}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Risk Assessment and Audit History */}
        <div className="lg:col-span-4 space-y-6">
          {/* Risk assessment card */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">
              Operational Risk Index
            </h3>

            <div className="relative pt-4 flex flex-col items-center justify-center">
              {/* Giant circular risk gauge */}
              <div className="text-center">
                <span className={`text-4xl font-black ${
                  boundedRisk > 80 ? "text-red-500 glow-text-red" :
                  boundedRisk > 60 ? "text-yellow-500" : "text-green-500"
                }`}>
                  {boundedRisk}%
                </span>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Overall Risk Score
                </span>
              </div>

              {/* Slider representation */}
              <div className="w-full bg-slate-800 h-2 rounded-full mt-6 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    boundedRisk > 80 ? "bg-red-500" : boundedRisk > 60 ? "bg-yellow-500" : "bg-green-500"
                  }`}
                  style={{ width: `${boundedRisk}%` }}
                />
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-normal">
              {boundedRisk > 70
                ? "WARNING: Aggregated hospital wait-times and ICU loads present critical operation bottlenecks. Action requested."
                : "Nominal operational risk. Keep monitoring inbound flows."}
            </p>
          </div>

          {/* Approved Audit log */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">
              Executed Commands Log
            </h3>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 text-xs">
              {approved.length === 0 ? (
                <div className="text-center py-6 text-slate-600 font-mono">
                  No commands executed in this session.
                </div>
              ) : (
                approved.map((rec) => (
                  <div key={rec.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1.5 font-mono">
                    <div className="flex items-center justify-between text-[9px] font-bold text-green-400">
                      <span>[APPROVED] {rec.id}</span>
                      <span>1m ago</span>
                    </div>
                    <p className="font-bold text-slate-300 text-[11px] leading-tight">{rec.title}</p>
                    <p className="text-[10px] text-slate-500 leading-normal">{rec.operationalImpact}</p>
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
