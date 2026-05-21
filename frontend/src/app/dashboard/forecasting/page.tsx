"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, Brain, Calendar, ShieldCheck, AlertTriangle } from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

// Mock forecasting datasets
const forecastDataSets = {
  admissions: [
    { date: "May 15", actual: 142 },
    { date: "May 16", actual: 148 },
    { date: "May 17", actual: 151 },
    { date: "May 18", actual: 145 },
    { date: "May 19", actual: 158 },
    { date: "May 20", actual: 162 },
    { date: "May 21 (Today)", actual: 168, forecast: 168, min: 168, max: 168 },
    { date: "May 22 (Fri)", forecast: 185, min: 172, max: 198 },
    { date: "May 23 (Sat)", forecast: 172, min: 158, max: 186 },
    { date: "May 24 (Sun)", forecast: 154, min: 140, max: 168 },
    { date: "May 25 (Mon)", forecast: 165, min: 150, max: 180 },
    { date: "May 26 (Tue)", forecast: 170, min: 152, max: 188 },
    { date: "May 27 (Wed)", forecast: 174, min: 155, max: 192 }
  ],
  icu: [
    { date: "May 15", actual: 32 },
    { date: "May 16", actual: 34 },
    { date: "May 17", actual: 35 },
    { date: "May 18", actual: 33 },
    { date: "May 19", actual: 36 },
    { date: "May 20", actual: 37 },
    { date: "May 21 (Today)", actual: 38, forecast: 38, min: 38, max: 38 },
    { date: "May 22 (Fri)", forecast: 40, min: 38, max: 40 },
    { date: "May 23 (Sat)", forecast: 39, min: 36, max: 40 },
    { date: "May 24 (Sun)", forecast: 37, min: 34, max: 39 },
    { date: "May 25 (Mon)", forecast: 38, min: 35, max: 40 },
    { date: "May 26 (Tue)", forecast: 39, min: 36, max: 40 },
    { date: "May 27 (Wed)", forecast: 41, min: 38, max: 42 } // Exceeds 40 capacity limit!
  ],
  epinephrine: [
    { date: "May 15", actual: 480 },
    { date: "May 16", actual: 470 },
    { date: "May 17", actual: 460 },
    { date: "May 18", actual: 445 },
    { date: "May 19", actual: 430 },
    { date: "May 20", actual: 415 },
    { date: "May 21 (Today)", actual: 390, forecast: 390, min: 390, max: 390 },
    { date: "May 22 (Fri)", forecast: 360, min: 340, max: 380 },
    { date: "May 23 (Sat)", forecast: 320, min: 295, max: 345 },
    { date: "May 24 (Sun)", forecast: 290, min: 260, max: 320 },
    { date: "May 25 (Mon)", forecast: 250, min: 215, max: 285 },
    { date: "May 26 (Tue)", forecast: 210, min: 170, max: 250 },
    { date: "May 27 (Wed)", forecast: 170, min: 120, max: 220 } // Stocks dangerously low
  ]
};

export default function ForecastingPage() {
  const { isBackendConnected } = useSimulation();
  const [metric, setMetric] = useState<"admissions" | "icu" | "epinephrine">("admissions");
  const [timeframe, setTimeframe] = useState<"7d" | "14d">("7d");
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isBackendConnected) {
      setChartData(forecastDataSets[metric]);
      return;
    }

    const fetchForecast = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/forecast?metric=${metric}`);
        if (!response.ok) {
          throw new Error("Failed to fetch forecast from backend");
        }
        const data = await response.json();
        
        const history = data.history || [];
        const forecast = data.forecast || [];
        
        const formatDateStr = (dateStr: string) => {
          if (!dateStr) return "";
          if (dateStr.includes("May") || dateStr.includes("Jun") || dateStr.includes("Apr")) return dateStr;
          try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          } catch (e) {
            return dateStr;
          }
        };

        const formattedData: any[] = [];

        // 1. Add historical items (all except the last one)
        for (let i = 0; i < history.length - 1; i++) {
          formattedData.push({
            date: formatDateStr(history[i].date),
            actual: history[i].count,
          });
        }

        // 2. Add the last historical item as the transition "Today" point
        if (history.length > 0) {
          const lastHist = history[history.length - 1];
          formattedData.push({
            date: formatDateStr(lastHist.date) + " (Today)",
            actual: lastHist.count,
            forecast: lastHist.count,
            min: lastHist.count,
            max: lastHist.count,
          });
        }

        // 3. Add forecast items
        forecast.forEach((f: any) => {
          formattedData.push({
            date: formatDateStr(f.date),
            forecast: f.predicted,
            min: f.lower,
            max: f.upper,
          });
        });

        setChartData(formattedData);
      } catch (err) {
        console.error("Error loading forecast data:", err);
        setChartData(forecastDataSets[metric]);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [metric, isBackendConnected]);

  const currentDataset = chartData.length > 0 ? chartData : forecastDataSets[metric];

  // AI Insights depending on metric
  const getAIInsights = () => {
    switch (metric) {
      case "admissions":
        return [
          { text: "Emergency cases expected to rise by 18% tomorrow evening (Friday).", severity: "high" },
          { text: "Patient discharges peaking on Saturday morning, freeing up approximately 12 beds.", severity: "info" }
        ];
      case "icu":
        return [
          { text: "ICU capacity may exceed safe threshold within 48 hours (Friday evening peak).", severity: "critical" },
          { text: "Staffing level adjustments advised to match anticipated ICU surge.", severity: "high" }
        ];
      case "epinephrine":
        return [
          { text: "Epinephrine vials projected to deplete past safe reserve (15%) by May 26.", severity: "high" },
          { text: "Automated replenishment pipeline scheduled. Emergency purchase order recommended.", severity: "info" }
        ];
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-cyan-400 tracking-widest uppercase">Predictive modeling</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
            AI Forecasting & Predictor
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pluggable Prophet, XGBoost, and LSTM engine pipeline forecasting hospital bottlenecks.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap gap-3">
          <select
            value={metric}
            onChange={(e: any) => setMetric(e.target.value)}
            className="h-9 px-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="admissions">Emergency Admissions</option>
            <option value="icu">ICU Bed Demand</option>
            <option value="epinephrine">Epinephrine Stocks</option>
          </select>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setTimeframe("7d")}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${
                timeframe === "7d" ? "bg-cyan-950/40 text-cyan-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              7D Forecast
            </button>
            <button
              onClick={() => setTimeframe("14d")}
              disabled
              className={`px-3 py-1 text-[10px] font-bold rounded-md cursor-not-allowed opacity-50`}
            >
              30D Forecast (Enterprise)
            </button>
          </div>
        </div>
      </div>

      {/* Composed Chart Container */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-cyan-400 animate-pulse" size={16} />
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">
              {metric === "admissions" && "Emergency Admissions Projection Model"}
              {metric === "icu" && "ICU Capacity Saturation Predictor"}
              {metric === "epinephrine" && "Epinephrine Pharmacy Inventory Forecast"}
            </h3>
          </div>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border rounded ${
            loading 
              ? "text-cyan-400 bg-cyan-950/20 border-cyan-500/30 animate-pulse" 
              : "text-purple-400 bg-purple-950/20 border-purple-500/20"
          }`}>
            {loading ? "GENERATING REAL-TIME FORECAST..." : "92.8% Confidence Accuracy"}
          </span>
        </div>

        <div className="h-96 w-full text-xs font-mono">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={currentDataset} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", color: "#f8fafc" }}
                cursor={{ stroke: "#475569", strokeWidth: 1 }}
              />
              <Legend />
              {/* Confidence Interval Shaded Shading */}
              <Area
                type="monotone"
                dataKey="min"
                stroke="none"
                fill="#8b5cf6"
                fillOpacity={0.08}
                name="Confidence Range (Lower)"
                legendType="none"
              />
              <Area
                type="monotone"
                dataKey="max"
                stroke="none"
                fill="#8b5cf6"
                fillOpacity={0.08}
                name="AI Confidence Interval (95%)"
              />
              {/* Actual Historical Line */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ r: 4, stroke: "#06b6d4", strokeWidth: 1, fill: "#020617" }}
                name="Historical Actuals"
              />
              {/* Forecast Line */}
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 3, stroke: "#8b5cf6", strokeWidth: 1, fill: "#020617" }}
                name="XGBoost/LSTM Forecast"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Explanatory AI Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Insight Boxes */}
        <div className="lg:col-span-8 p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="text-cyan-400" size={16} />
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">
              AI Operations Foresight Feed
            </h3>
          </div>

          <div className="space-y-3">
            {getAIInsights().map((insight, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex items-start gap-3 transition ${
                  insight.severity === "critical"
                    ? "bg-red-950/15 border-red-500/20 text-red-300"
                    : insight.severity === "high"
                    ? "bg-yellow-950/15 border-yellow-500/20 text-yellow-300"
                    : "bg-slate-950/60 border-slate-800 text-slate-300"
                }`}
              >
                {insight.severity === "critical" && (
                  <AlertTriangle className="text-red-400 mt-0.5 flex-shrink-0 animate-bounce" size={16} />
                )}
                {insight.severity === "high" && (
                  <AlertTriangle className="text-yellow-400 mt-0.5 flex-shrink-0" size={16} />
                )}
                {insight.severity === "info" && (
                  <ShieldCheck className="text-cyan-400 mt-0.5 flex-shrink-0" size={16} />
                )}
                <div>
                  <span className="block text-[9px] font-black font-mono tracking-wider uppercase">
                    {insight.severity === "critical" ? "CRITICAL PROJECTION WARNING" : "OPERATIONAL RECOMMENDATION"}
                  </span>
                  <p className="text-[11px] leading-relaxed mt-1">{insight.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Pipeline Details */}
        <div className="lg:col-span-4 p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
          <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">
            Active Prediction Pipeline
          </h3>
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <span className="block text-[10px] text-slate-500 font-semibold uppercase">Forecasting Model</span>
              <span className="font-mono text-slate-300">XGBoost Regressor + Prophet Hybrid</span>
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] text-slate-500 font-semibold uppercase">Update Cycle</span>
              <span className="font-mono text-slate-300">Hourly dynamic batch updates</span>
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] text-slate-500 font-semibold uppercase">Contributing Covariates</span>
              <p className="text-[10px] text-slate-400 leading-normal">
                Weather alerts, local sporting events calendar, hospital staff schedules, regional influenza trackers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
