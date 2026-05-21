"use client";

import React, { useState } from "react";
import { useSimulation, Patient } from "@/context/SimulationContext";
import { Network, Users, ArrowRight, Activity, TrendingUp, AlertTriangle } from "lucide-react";

export default function PatientFlowPage() {
  const { patients, resources } = useSimulation();
  const [selectedZone, setSelectedZone] = useState<string>("Emergency");

  // Zone statistics helper
  const getZoneStats = (zone: string) => {
    const active = patients.filter((p) => p.department === zone);
    const capacityInfo = resources.find((r) => r.name.toLowerCase().includes(zone.toLowerCase()));
    const total = capacityInfo ? capacityInfo.total : 50;
    const allocated = capacityInfo ? capacityInfo.allocated : active.length;
    return {
      active: active.length,
      allocated,
      total,
      occupancy: Math.round((allocated / total) * 100)
    };
  };

  // Zones metadata for coordinates in flow layout
  const zones = [
    { name: "Emergency", label: "Emergency (ER)", x: 50, y: 150, color: "#ef4444" },
    { name: "ICU", label: "Intensive Care (ICU)", x: 250, y: 70, color: "#a855f7" },
    { name: "General Medicine", label: "General Medicine", x: 250, y: 230, color: "#3b82f6" },
    { name: "Cardiology", label: "Cardiology Unit", x: 450, y: 70, color: "#ec4899" },
    { name: "Surgery", label: "Surgical Theater", x: 450, y: 230, color: "#10b981" },
    { name: "Discharged", label: "Discharged", x: 650, y: 150, color: "#06b6d4" }
  ];

  const activePatientsInZone = patients.filter((p) => {
    if (selectedZone === "Discharged") return p.status === "Discharged";
    return p.department === selectedZone;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-cyan-400 tracking-widest uppercase">Flow network</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
            Patient Flow Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visualizing patient movements, ward transitions, and bottlenecks across hospital boundaries.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Animated Patient Flow Map */}
        <div className="lg:col-span-8 p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">
              Live Flow Network Map
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
              Click nodes to filter active patients. Pulse intensity reflects flow rates.
            </p>
          </div>

          {/* Flow Visualizer SVG Container */}
          <div className="w-full bg-slate-950/80 rounded-xl border border-slate-900/80 p-4 overflow-x-auto relative">
            <svg className="w-[750px] h-[320px] mx-auto overflow-visible font-mono" viewBox="0 0 750 320">
              <defs>
                {/* Marker for arrows */}
                <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#1e293b" />
                </marker>
                <marker id="arrow-glow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4" />
                </marker>
              </defs>

              {/* Transition Paths */}
              {/* ER to ICU */}
              <path d="M 90 150 L 210 70" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5 5" markerEnd="url(#arrow)" />
              {/* ER to General Wards */}
              <path d="M 90 150 L 210 230" fill="none" stroke="#06b6d4" strokeWidth="3" markerEnd="url(#arrow-glow)" className="animate-pulse" />
              {/* ICU to Cardio */}
              <path d="M 290 70 L 410 70" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5 5" markerEnd="url(#arrow)" />
              {/* General to Surgery */}
              <path d="M 290 230 L 410 230" fill="none" stroke="#06b6d4" strokeWidth="3" markerEnd="url(#arrow-glow)" />
              {/* Cardio to Discharge */}
              <path d="M 490 70 L 610 150" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5 5" markerEnd="url(#arrow)" />
              {/* Surgery to Discharge */}
              <path d="M 490 230 L 610 150" fill="none" stroke="#06b6d4" strokeWidth="2" markerEnd="url(#arrow-glow)" />

              {/* Nodes */}
              {zones.map((z) => {
                const isSelected = selectedZone === z.name;
                const stats = getZoneStats(z.name);
                const isOverload = stats.occupancy > 90;

                return (
                  <g
                    key={z.name}
                    className="cursor-pointer group"
                    onClick={() => setSelectedZone(z.name)}
                  >
                    {/* Glowing background ring */}
                    <circle
                      cx={z.x}
                      cy={z.y}
                      r="28"
                      fill="none"
                      stroke={isOverload ? "#ef4444" : z.color}
                      strokeWidth="1.5"
                      className={`transition-all duration-300 opacity-20 ${isSelected ? "opacity-100 r-32 stroke-2" : "group-hover:opacity-65"}`}
                    />
                    {/* Node Core */}
                    <circle
                      cx={z.x}
                      cy={z.y}
                      r="22"
                      fill="#020617"
                      stroke={isSelected ? z.color : "#1e293b"}
                      strokeWidth="2"
                    />
                    {/* Icon or Value Centered */}
                    <text
                      x={z.x}
                      y={z.y + 4}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {stats.occupancy}%
                    </text>
                    {/* Label */}
                    <text
                      x={z.x}
                      y={z.y + 42}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {z.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Node Detail List panel */}
        <div className="lg:col-span-4 p-6 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col justify-between h-[450px]">
          <div className="space-y-4 overflow-hidden flex flex-col flex-1">
            <div>
              <span className="text-[10px] font-bold text-slate-500 font-mono tracking-widest uppercase block">
                ZONE ACTIVE PATIENTS
              </span>
              <h3 className="font-bold text-base text-slate-200 mt-0.5">{selectedZone}</h3>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 pr-1 text-xs">
              {activePatientsInZone.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-mono">
                  No active patients logged in this sector.
                </div>
              ) : (
                activePatientsInZone.map((p) => (
                  <div key={p.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{p.name}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        p.severity === "Critical" ? "bg-red-950 text-red-400" : "bg-slate-900 text-slate-400"
                      }`}>
                        {p.severity}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                      <div>Age/Gender: {p.age} / {p.gender}</div>
                      <div>Status: {p.status}</div>
                      {p.bedNumber && <div className="col-span-2">Bed Assigned: {p.bedNumber}</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900/80">
            <span className="text-[9px] font-bold text-slate-500 font-mono block">ZONE CAPACITY INDEX</span>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-slate-300">
                {getZoneStats(selectedZone).allocated} of {getZoneStats(selectedZone).total} beds active
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {getZoneStats(selectedZone).occupancy}% Load
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
