"use client";

import React, { useState } from "react";
import { useSimulation, Patient } from "@/context/SimulationContext";
import { Clock, Navigation, AlertTriangle, UserCheck, ShieldCheck, Heart } from "lucide-react";

export default function MonitoringPage() {
  const { patients, ambulances, resources } = useSimulation();
  const [filterSeverity, setFilterSeverity] = useState<string>("All");

  const triagePatients = patients.filter((p) => p.status === "In Triage" || p.status === "Awaiting Doctor");
  const filteredPatients = filterSeverity === "All"
    ? triagePatients
    : triagePatients.filter(p => p.severity === filterSeverity);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-cyan-400 tracking-widest uppercase">Live operations telemetry</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4] animate-pulse" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
            Real-Time Hospital Monitoring
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tracking active triage queues, emergency arrivals, doctor availabilities, and active ambulance coordinates.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px] font-bold">
          {["All", "Critical", "Severe", "Moderate"].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-md transition ${
                filterSeverity === sev ? "bg-cyan-950/40 text-cyan-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Triage Queue */}
        <div className="lg:col-span-8 p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-6 flex flex-col h-[520px]">
          <div>
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">
              Emergency Admissions Triage Queue
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
              Patients currently awaiting assessment or doctor allocation. Sorted by severity.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-20 text-slate-500 font-mono">
                No patients waiting in the triage queue.
              </div>
            ) : (
              filteredPatients.map((p) => {
                const waitLimit = p.severity === "Critical" ? 10 : p.severity === "Severe" ? 20 : 45;
                const isOverWait = p.waitTime > waitLimit;

                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-xl border bg-slate-950/40 flex items-center justify-between gap-4 transition ${
                      isOverWait ? "border-red-500/20 bg-red-950/[0.02]" : "border-slate-850"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Status indicator indicator */}
                      <span className={`w-2 h-2 rounded-full ${
                        p.severity === "Critical" ? "bg-red-500 shadow-[0_0_6px_#ef4444] animate-pulse" :
                        p.severity === "Severe" ? "bg-yellow-500" : "bg-cyan-500"
                      }`} />
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{p.name}</span>
                          <span className="text-[9px] text-slate-500 font-mono">ID: {p.id}</span>
                        </div>
                        <div className="flex gap-4 text-[10px] text-slate-500 mt-1">
                          <span>Age/Gender: {p.age} / {p.gender}</span>
                          <span>Arrival: {p.admittedAt}</span>
                          <span>Status: {p.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="block text-[10px] text-slate-500 font-mono">WAIT TIME</span>
                      <span className={`text-sm font-black ${isOverWait ? "text-red-400 font-bold" : "text-slate-300"}`}>
                        {p.waitTime} mins
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live Ambulance Tracker & Staff Status */}
        <div className="lg:col-span-4 space-y-6">
          {/* Ambulance board */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
              <Navigation className="text-cyan-400 animate-pulse" size={14} /> Live Ambulance Fleet
            </h3>

            <div className="space-y-3 text-xs">
              {ambulances.map((amb) => (
                <div key={amb.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-300">{amb.code}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      amb.status.includes("En Route") ? "bg-cyan-950 text-cyan-400 border border-cyan-500/20" :
                      amb.status.includes("Scene") ? "bg-red-950 text-red-400" : "bg-slate-900 text-slate-500"
                    }`}>
                      {amb.status}
                    </span>
                  </div>

                  {amb.status !== "Available" && (
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                      <span>Inbound ETA: <b className="text-slate-300">{amb.eta} mins</b></span>
                      {amb.patientSeverity !== "None" && (
                        <span className="text-red-400 font-bold">Severity: {amb.patientSeverity}</span>
                      )}
                    </div>
                  )}

                  {/* Relative map position indicator */}
                  <div className="w-full bg-slate-900 h-1 rounded-full relative overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 bg-cyan-500 transition-all duration-1000"
                      style={{ left: `${amb.coordinates.x}%`, width: "4px" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor availability status */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
              <UserCheck className="text-purple-400" size={14} /> Medical Staff Allocation
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Emergency Staff (Nurses)</span>
                <span className="text-cyan-400 font-bold">
                  {(() => {
                    const res = resources.find((r) => r.id === "RES-05");
                    const active = res ? res.allocated : 18;
                    const reserve = res ? Math.max(0, res.total - res.allocated) : 2;
                    return `${active} Active / ${reserve} Reserve`;
                  })()}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">On-Duty Physicians</span>
                <span className="text-cyan-400 font-bold">4 Active / 1 Reserve</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-400">Cardiology Residents</span>
                <span className="text-cyan-400 font-bold">2 Active / 1 Surgery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
