"use client";

import React, { useState } from "react";
import { useSimulation } from "@/context/SimulationContext";
import { FileText, Printer, Download, Sparkles, CheckSquare } from "lucide-react";

export default function ReportsPage() {
  const { patients, resources, anomalies, role } = useSimulation();
  const [selectedTemplate, setSelectedTemplate] = useState("exec");

  // Calculations for current report state
  const totalPatientsCount = patients.length + 154;
  const icuBeds = resources.find(r => r.id === "RES-01");
  const icuOccupancy = icuBeds ? Math.round((icuBeds.allocated / icuBeds.total) * 100) : 95;
  const avgWait = anomalies.some(a => a.type === "Unusual Wait Spike") ? 65 : 42;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-12 print:p-0 print:m-0">
      {/* Header - hide on print */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-cyan-400 tracking-widest uppercase">Compliance exports</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
            Report Generation Module
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate and export printable compliance reports for hospital executives and regional directors.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-slate-950 transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/25"
          >
            <Printer size={14} /> Print Report
          </button>
          <button
            onClick={() => alert("Report compiled and downloaded as PDF.")}
            className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 transition flex items-center gap-1.5"
          >
            <Download size={14} /> Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Templates list - hide on print */}
        <div className="lg:col-span-4 p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-6 print:hidden">
          <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">
            Report Templates
          </h3>

          <div className="space-y-3">
            <button
              onClick={() => setSelectedTemplate("exec")}
              className={`w-full p-4 rounded-xl border text-left transition flex items-start gap-3 ${
                selectedTemplate === "exec"
                  ? "bg-cyan-950/20 border-cyan-500 text-cyan-400"
                  : "bg-slate-950/60 border-slate-900 text-slate-400 hover:border-slate-800"
              }`}
            >
              <FileText className="mt-0.5 shrink-0" size={16} />
              <div>
                <span className="block text-xs font-bold">Executive Operations Summary</span>
                <span className="block text-[10px] text-slate-500 leading-normal mt-0.5">Comprehensive snapshot of patients, wait indicators, and resource health indexes.</span>
              </div>
            </button>

            <button
              onClick={() => setSelectedTemplate("resources")}
              className={`w-full p-4 rounded-xl border text-left transition flex items-start gap-3 ${
                selectedTemplate === "resources"
                  ? "bg-cyan-950/20 border-cyan-500 text-cyan-400"
                  : "bg-slate-950/60 border-slate-900 text-slate-400 hover:border-slate-800"
              }`}
            >
              <FileText className="mt-0.5 shrink-0" size={16} />
              <div>
                <span className="block text-xs font-bold">Resource & Supply Pipeline</span>
                <span className="block text-[10px] text-slate-500 leading-normal mt-0.5">Audit checklist tracking ventilators, beds, active nurse shifts, and drug logs.</span>
              </div>
            </button>
          </div>
        </div>

        {/* Report Preview Panel */}
        <div className="lg:col-span-8 p-8 rounded-xl border border-slate-800 bg-slate-950/80 space-y-8 shadow-2xl relative print:border-none print:bg-white print:text-black">
          {/* Logo header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-900 print:border-slate-300">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center print:bg-black">
                <span className="font-black text-white text-sm">M</span>
              </div>
              <div>
                <span className="font-bold tracking-wider text-slate-100 text-sm print:text-black">MEDIOPS AI SYSTEMS</span>
                <span className="block text-[8px] text-slate-500 font-mono uppercase print:text-slate-600">Decision Intelligence Platform</span>
              </div>
            </div>
            <div className="text-right font-mono text-[10px] text-slate-500 print:text-slate-600">
              <div>REPORT #MO-{Math.floor(1000 + Math.random() * 9000)}</div>
              <div>GENERATED: {new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-100 print:text-black">
              {selectedTemplate === "exec" && "Executive Operations Performance Summary"}
              {selectedTemplate === "resources" && "Clinical Resource & Supply Log"}
            </h2>
            <p className="text-xs text-slate-400 print:text-slate-600 leading-relaxed">
              This document contains active clinical metrics processed by MediOps AI analytics pipelines. Telemetry logs are verified and compliant under regional healthcare authority specifications.
            </p>
          </div>

          {/* Report core statistics cards */}
          {selectedTemplate === "exec" && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6 p-4 bg-slate-900/30 rounded-lg border border-slate-900 print:bg-slate-100 print:border-slate-300 print:text-black">
                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase print:text-slate-600">Total Patient Load</span>
                  <span className="text-xl font-bold text-cyan-400 mt-1 block print:text-black">{totalPatientsCount}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase print:text-slate-600">ICU Bed Occupancy</span>
                  <span className="text-xl font-bold text-purple-400 mt-1 block print:text-black">{icuOccupancy}%</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase print:text-slate-600">Avg ER Wait Time</span>
                  <span className="text-xl font-bold text-red-400 mt-1 block print:text-black">{avgWait}m</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider font-mono print:text-black">Active Anomalies Checked</h4>
                <div className="space-y-2 text-xs font-mono">
                  {anomalies.filter(a => a.status === "Active").map(a => (
                    <div key={a.id} className="flex justify-between p-2.5 bg-slate-900/20 border border-slate-900 rounded print:border-slate-200">
                      <span className="text-red-400 font-bold">[{a.type}]</span>
                      <span className="text-slate-400 print:text-black">{a.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTemplate === "resources" && (
            <div className="space-y-6">
              <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider font-mono print:text-black">Active Inventory Audit</h4>
              <div className="border border-slate-900 rounded-lg overflow-hidden text-xs font-mono print:border-slate-300 print:text-black">
                <div className="grid grid-cols-4 p-3 bg-slate-900/50 border-b border-slate-900 font-bold print:bg-slate-100">
                  <div>Resource Name</div>
                  <div>Category</div>
                  <div>Active Use</div>
                  <div>Reserve Ratio</div>
                </div>
                <div className="divide-y divide-slate-900 print:divide-slate-300">
                  {resources.map((r) => (
                    <div key={r.id} className="grid grid-cols-4 p-3 hover:bg-slate-900/10">
                      <div className="font-bold text-slate-300 print:text-black">{r.name}</div>
                      <div>{r.category}</div>
                      <div>{r.allocated} {r.unit}</div>
                      <div className="font-bold text-cyan-400 print:text-black">
                        {Math.round(((r.total - r.allocated) / r.total) * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Verification section */}
          <div className="pt-8 border-t border-slate-900/80 flex justify-between items-end text-xs font-mono print:border-slate-300">
            <div className="text-slate-500">
              <div>REPORT AUTHORITY: MEDIOPS DECISION ENGINE</div>
              <div>VERIFICATION HASH: MO-{Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
            </div>
            <div className="text-right">
              <div className="h-10 w-24 border-b border-slate-800 inline-block mb-1 print:border-black" />
              <div className="text-slate-400 print:text-black font-semibold">Authorized Administrator Signoff</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
