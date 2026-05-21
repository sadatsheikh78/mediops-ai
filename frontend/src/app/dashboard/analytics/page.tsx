"use client";

import React, { useState } from "react";
import { BarChart3, Filter, ShieldCheck, Heart } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  Cell,
  PieChart,
  Pie
} from "recharts";

// Mock datasets for analytics
const diseaseTrendData = [
  { week: "Wk 18", influenza: 45, cardiac: 28, trauma: 32 },
  { week: "Wk 19", influenza: 50, cardiac: 30, trauma: 35 },
  { week: "Wk 20", influenza: 62, cardiac: 27, trauma: 30 },
  { week: "Wk 21", influenza: 58, cardiac: 35, trauma: 40 },
  { week: "Wk 22", influenza: 48, cardiac: 32, trauma: 45 } // Peak trauma
];

const revenueData = [
  { dept: "ER", revenue: 145000, cost: 110000 },
  { dept: "ICU", revenue: 320000, cost: 280000 },
  { dept: "Cardio", revenue: 240000, cost: 180000 },
  { dept: "Surgery", revenue: 410000, cost: 310000 },
  { dept: "Pediatrics", revenue: 95000, cost: 85000 }
];

const demographicsData = [
  { name: "0-18 yrs", value: 45, color: "#06b6d4" },
  { name: "19-50 yrs", value: 110, color: "#3b82f6" },
  { name: "51-70 yrs", value: 140, color: "#8b5cf6" },
  { name: "70+ yrs", value: 85, color: "#ec4899" }
];

const efficiencyData = [
  { name: "Dr. Adams", patients: 28, waitTime: 22 },
  { name: "Dr. Blevins", patients: 35, waitTime: 18 },
  { name: "Dr. Chen", patients: 18, waitTime: 15 },
  { name: "Dr. Davis", patients: 42, waitTime: 29 },
  { name: "Dr. Ebrahim", patients: 30, waitTime: 24 }
];

export default function AnalyticsPage() {
  const [activeDept, setActiveDept] = useState("all");
  const [dateRange, setDateRange] = useState("30d");

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-cyan-400 tracking-widest uppercase">Business intelligence</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
            Healthcare Analytics Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise analytics drilldown scanning treatment outcomes, financial balances, and clinical efficiency.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-xs font-semibold text-slate-300">
            <Filter size={14} className="text-slate-500" />
            <span>Dept:</span>
            <select
              value={activeDept}
              onChange={(e) => setActiveDept(e.target.value)}
              className="bg-transparent focus:outline-none"
            >
              <option value="all">All Departments</option>
              <option value="er">Emergency (ER)</option>
              <option value="icu">Intensive Care (ICU)</option>
              <option value="cardio">Cardiology</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-xs font-semibold text-slate-300">
            <span>Period:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent focus:outline-none"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Row 1: Disease trends and Revenue Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Disease trends */}
        <div className="lg:col-span-7 p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">
              Clinical Disease Vector Trends
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Weekly diagnostics trends across major clinical sectors.</p>
          </div>

          <div className="h-64 w-full text-[10px] font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={diseaseTrendData}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="week" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b" }} />
                <Legend />
                <Line type="monotone" dataKey="influenza" name="Influenza Admissions" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="cardiac" name="Cardiac incidents" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="trauma" name="Trauma/Accident" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue/Costs */}
        <div className="lg:col-span-5 p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">
              Departmental Operational Margin
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Active treatment billings vs operational maintenance budgets.</p>
          </div>

          <div className="h-64 w-full text-[10px] font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid stroke="#1e293b" />
                <XAxis dataKey="dept" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b" }} />
                <Legend />
                <Bar dataKey="revenue" name="Billing Inflow ($)" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                <Bar dataKey="cost" name="Resource Costs ($)" fill="#1e293b" stroke="#06b6d4" strokeWidth={0.5} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Demographics and Physician efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Demographics pie */}
        <div className="lg:col-span-5 p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">
              Patient Age Distribution
            </h3>
          </div>

          <div className="h-60 w-full flex items-center justify-between text-xs font-mono">
            <div className="w-[50%] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demographicsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {demographicsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-[45%] space-y-2">
              {demographicsData.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-400 font-semibold">{d.name}</span>
                  </div>
                  <span className="font-bold text-slate-200">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Doctor efficiency scatter */}
        <div className="lg:col-span-7 p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">
              Physician Consultation Throughput
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Comparing number of consults (X) with average wait metrics (Y).</p>
          </div>

          <div className="h-60 w-full text-[10px] font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid stroke="#1e293b" />
                <XAxis type="number" dataKey="patients" name="Patients Treated" stroke="#64748b" label={{ value: "Patients Treated", position: "insideBottom", offset: -5, fill: "#64748b" }} />
                <YAxis type="number" dataKey="waitTime" name="Avg Consult Time" unit="m" stroke="#64748b" label={{ value: "Consult Time (m)", angle: -90, position: "insideLeft", fill: "#64748b" }} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b" }} />
                <Scatter name="Staff Efficiency" data={efficiencyData} fill="#8b5cf6">
                  {efficiencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 1 ? "#06b6d4" : "#8b5cf6"} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
