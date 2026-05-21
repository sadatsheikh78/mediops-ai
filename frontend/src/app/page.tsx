"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  Brain,
  TrendingUp,
  Database,
  Shield,
  ArrowRight,
  CheckCircle2,
  Users,
  Layers,
  Sparkles,
  Play,
  Zap,
  Clock,
  Heart
} from "lucide-react";

export default function LandingPage() {
  // Scenario simulation state on landing page
  const [simulationScenario, setSimulationScenario] = useState<"NORMAL" | "ER_SURGE" | "ICU_OVERLOAD">("NORMAL");
  const [metrics, setMetrics] = useState({
    erWaitTime: 24,
    icuBeds: "32 / 40",
    icuColor: "text-cyan-400",
    icuProgress: 80,
    erColor: "text-cyan-400",
    recommendation: "All operations stabilized. System monitoring nominal throughput."
  });

  useEffect(() => {
    if (simulationScenario === "NORMAL") {
      setMetrics({
        erWaitTime: 24,
        icuBeds: "32 / 40",
        icuColor: "text-green-400",
        icuProgress: 80,
        erColor: "text-green-400",
        recommendation: "All operations stabilized. System monitoring nominal throughput."
      });
    } else if (simulationScenario === "ER_SURGE") {
      setMetrics({
        erWaitTime: 78,
        icuBeds: "34 / 40",
        icuColor: "text-yellow-400",
        icuProgress: 85,
        erColor: "text-red-400 font-bold animate-pulse",
        recommendation: "CRITICAL: Deploy 2 additional nurses to ED. Expected wait compression: -22 mins."
      });
    } else if (simulationScenario === "ICU_OVERLOAD") {
      setMetrics({
        erWaitTime: 35,
        icuBeds: "40 / 40",
        icuColor: "text-red-400 font-bold animate-pulse",
        icuProgress: 100,
        erColor: "text-yellow-400",
        recommendation: "CRITICAL: Initiate rapid step-down discharge reviews for 3 eligible ICU patients."
      });
    }
  }, [simulationScenario]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 cyber-grid relative overflow-hidden">
      {/* Glowing background shapes */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-cyan-900/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[180px] pointer-events-none" />

      {/* Grid Scanline Animation */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-500/[0.01] to-transparent h-1/2 w-full animate-scanline" />

      {/* Navigation Header */}
      <header className="border-b border-slate-900 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="font-black text-white text-sm">M</span>
            </div>
            <div>
              <span className="font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 text-sm">MEDIOPS AI</span>
              <span className="block text-[8px] text-slate-500 tracking-widest -mt-1 font-mono uppercase">Decision Intel</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400">
            <a href="#features" className="hover:text-cyan-400 transition">FEATURES</a>
            <a href="#analytics" className="hover:text-cyan-400 transition">ANALYTICS</a>
            <a href="#decision" className="hover:text-cyan-400 transition">DECISION ENGINE</a>
            <a href="#pricing" className="hover:text-cyan-400 transition">PRICING</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <button className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 transition">
                Demo Sign In
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/20">
                Launch Platform <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/20 text-cyan-400 text-[10px] font-bold tracking-wider uppercase font-mono">
            <Sparkles size={12} className="animate-pulse" /> AI-powered hospital operations OS
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Predictive Intelligence for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
              Hospital Decisions & Flows
            </span>
          </h1>

          <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-lg">
            MediOps AI maps real-time patient throughput, anticipates ICU congestions 48h in advance, flags financial anomalies, and prescribes optimal staffing configurations—delivering Palantir-tier command center capabilities to health administrators.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/dashboard">
              <button className="px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-slate-950 transition flex items-center gap-2 shadow-lg shadow-cyan-500/25">
                Access Decision Console <Play size={12} fill="currentColor" />
              </button>
            </Link>
            <a href="#simulator">
              <button className="px-6 py-3 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-xs font-bold text-slate-300 transition">
                Try Scenario Simulator
              </button>
            </a>
          </div>

          {/* Micro Stat Counter */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-900">
            <div>
              <span className="block text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">22%</span>
              <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase font-mono">Avg Wait Reduction</span>
            </div>
            <div>
              <span className="block text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">92%</span>
              <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase font-mono font-mono">AI Recommendation Acc.</span>
            </div>
            <div>
              <span className="block text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">4.8h</span>
              <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase font-mono">Bed Lead Time Saved</span>
            </div>
          </div>
        </div>

        {/* Interactive Mockup Dashboard Simulator */}
        <div id="simulator" className="lg:col-span-6 glass-panel rounded-2xl border border-slate-800/80 p-6 relative shadow-2xl">
          {/* Glowing panel header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-900 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-[10px] text-slate-500 font-mono ml-2">SIMULATION_SANDBOX.sh</span>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-cyan-500/20">
              Interactive Mockup
            </span>
          </div>

          <div className="space-y-4">
            <div className="text-xs font-semibold text-slate-400">
              Toggle Operational Scenario:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSimulationScenario("NORMAL")}
                className={`py-2 px-3 rounded-lg text-[10px] font-bold border transition ${
                  simulationScenario === "NORMAL"
                    ? "bg-cyan-950/20 border-cyan-500 text-cyan-400"
                    : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                Normal Flow
              </button>
              <button
                onClick={() => setSimulationScenario("ER_SURGE")}
                className={`py-2 px-3 rounded-lg text-[10px] font-bold border transition ${
                  simulationScenario === "ER_SURGE"
                    ? "bg-red-950/20 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                    : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                Trauma ER Surge
              </button>
              <button
                onClick={() => setSimulationScenario("ICU_OVERLOAD")}
                className={`py-2 px-3 rounded-lg text-[10px] font-bold border transition ${
                  simulationScenario === "ICU_OVERLOAD"
                    ? "bg-purple-950/20 border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                    : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                ICU Saturation
              </button>
            </div>

            {/* Dashboard Mockup Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/80">
                <span className="block text-[10px] font-semibold text-slate-500 tracking-wider uppercase font-mono">ER Wait Time</span>
                <span className={`block text-2xl font-black mt-1 transition-colors ${metrics.erColor}`}>
                  {metrics.erWaitTime} mins
                </span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (metrics.erWaitTime / 90) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/80">
                <span className="block text-[10px] font-semibold text-slate-500 tracking-wider uppercase font-mono">ICU Occupancy</span>
                <span className={`block text-2xl font-black mt-1 transition-colors ${metrics.icuColor}`}>
                  {metrics.icuBeds}
                </span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-purple-500 h-full transition-all duration-500"
                    style={{ width: `${metrics.icuProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* AI recommendation bar */}
            <div className="p-4 rounded-xl border border-slate-800/60 bg-gradient-to-r from-slate-900 to-slate-950 relative overflow-hidden">
              <div className="flex items-start gap-3">
                <Brain className="text-cyan-400 mt-0.5 flex-shrink-0 animate-pulse" size={16} />
                <div>
                  <span className="block text-[9px] font-black text-cyan-400 uppercase tracking-widest font-mono">AI DECISION ADVICE</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed mt-1">{metrics.recommendation}</p>
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link href="/dashboard">
                <button className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1.5 mx-auto">
                  Run Full Operations Dashboard <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight">Enterprise Infrastructure for Modern Healthcare</h2>
          <p className="text-slate-400 text-sm">
            MediOps AI is not just a reporting dashboard; it is a clinical operational control system engineered for efficiency and patient outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* F-1 */}
          <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-xl hover:border-slate-800/80 transition space-y-4">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center">
              <Activity className="text-cyan-400" size={20} />
            </div>
            <h3 className="font-bold text-base text-slate-200">Real-Time Hospital Monitoring</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Track emergency admissions, ward occupancy maps, patient triages, and active ambulances through responsive, low-latency data streams.
            </p>
          </div>
          {/* F-2 */}
          <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-xl hover:border-slate-800/80 transition space-y-4">
            <div className="w-10 h-10 rounded-lg bg-purple-950/40 border border-purple-500/20 flex items-center justify-center">
              <Brain className="text-purple-400" size={20} />
            </div>
            <h3 className="font-bold text-base text-slate-200">Decision Intelligence Engine</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Get prescriptive operations guidance. Execute one-click staff reallocations, bed step-down discharge triggers, and supplier re-orders.
            </p>
          </div>
          {/* F-3 */}
          <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-xl hover:border-slate-800/80 transition space-y-4">
            <div className="w-10 h-10 rounded-lg bg-blue-950/40 border border-blue-500/20 flex items-center justify-center">
              <TrendingUp className="text-blue-400" size={20} />
            </div>
            <h3 className="font-bold text-base text-slate-200">Predictive Machine Learning</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Forecast emergency inflows, ICU bed loads, and medication stocks up to 7 days ahead with confidence intervals.
            </p>
          </div>
        </div>
      </section>

      {/* Deep-Dive Section: AI Decision Engine */}
      <section id="decision" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6 order-2 lg:order-1">
          <div className="relative p-6 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-purple-400 font-bold tracking-widest uppercase">RECOMMENDATION ENGINE</span>
                <span className="text-[10px] font-mono bg-purple-950 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded font-bold">
                  94% CONFIDENCE
                </span>
              </div>
              <h4 className="font-bold text-base text-slate-200">Deploy Additional Staff to ED</h4>
              
              <div className="space-y-2">
                <div className="text-[10px] font-semibold text-slate-500 tracking-wider font-mono uppercase">EXPLAINABLE FACTORS:</div>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2 text-xs text-slate-400">
                    <CheckCircle2 size={12} className="text-purple-400" /> ER wait times crossed threshold (65 mins)
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-400">
                    <CheckCircle2 size={12} className="text-purple-400" /> 3 incoming severe trauma ambulances expected
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-400">
                    <CheckCircle2 size={12} className="text-purple-400" /> Staff utilization in General Wards currently at 62%
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                <span className="font-bold text-slate-300">Operational Impact:</span> Reallocating 2 nurses will reduce average triage backlog by 18 mins, balancing department utilization ratios.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400 hover:text-slate-200">Dismiss</button>
                <button className="px-3 py-1.5 rounded bg-purple-600 text-[10px] font-bold text-white hover:bg-purple-500 shadow-lg shadow-purple-500/20">Approve & Execute</button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-950/20 text-purple-400 text-[10px] font-bold tracking-wider uppercase font-mono">
            <Brain size={12} /> Explainable Decision Intelligence
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">AI Decisions You Can Audibly Trace</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Healthcare systems require complete visibility. MediOps AI provides clear explanations for every recommendation: citing contributing factors, measuring confidence scores, assessing clinical risk, and charting immediate operational impacts.
          </p>
          <div className="space-y-3 font-semibold text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-[10px] border border-slate-800 text-cyan-400">1</div>
              <span>Fully traceable clinical suggestions</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-[10px] border border-slate-800 text-cyan-400">2</div>
              <span>Audit logging tracking all approvals</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-[10px] border border-slate-800 text-cyan-400">3</div>
              <span>Seamless EHR / FHIR integration layout</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Matrix */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight">Scale Across the Health Network</h2>
          <p className="text-slate-400 text-sm">
            Flexible deployments tailored for municipal networks, regional clinics, and enterprise hospital systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* P1 */}
          <div className="p-8 bg-slate-900/30 border border-slate-900 rounded-2xl relative flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-slate-500 font-mono tracking-widest uppercase">REGIONAL LEVEL</span>
              <h3 className="text-2xl font-black text-slate-200">Clinic OS</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Full dashboard monitor, bed availability maps, and emergency indicators for small to mid-sized singular clinics.
              </p>
            </div>
            <div className="space-y-4">
              <div className="text-3xl font-black">$2,499<span className="text-xs text-slate-500 font-semibold font-mono"> / month</span></div>
              <Link href="/dashboard">
                <button className="w-full py-2.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-xs font-bold text-slate-300 transition">
                  Activate Demo Instance
                </button>
              </Link>
            </div>
          </div>

          {/* P2 - Featured */}
          <div className="p-8 bg-slate-900/60 border-2 border-cyan-500/50 rounded-2xl relative flex flex-col justify-between space-y-8 shadow-xl shadow-cyan-950/10">
            <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-[9px] font-extrabold text-white uppercase tracking-widest font-mono">
              RECOMMENDED
            </div>
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest uppercase">SINGLE HOSPITAL</span>
              <h3 className="text-2xl font-black text-slate-200">Hospital Command</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Advanced AI recommendations, predictive analytics (ICU & Wards), explainable factors, and assistant chatbot integration.
              </p>
            </div>
            <div className="space-y-4">
              <div className="text-3xl font-black">$5,999<span className="text-xs text-slate-500 font-semibold font-mono"> / month</span></div>
              <Link href="/dashboard">
                <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white transition shadow-lg shadow-cyan-500/25">
                  Request Trial Access
                </button>
              </Link>
            </div>
          </div>

          {/* P3 */}
          <div className="p-8 bg-slate-900/30 border border-slate-900 rounded-2xl relative flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-slate-500 font-mono tracking-widest uppercase">HEALTH NETWORK</span>
              <h3 className="text-2xl font-black text-slate-200">Enterprise Operations</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Multi-hospital aggregation, federated machine learning pipelines, custom FHIR/HL7 integrations, and 24/7 dedicated engineering SLA.
              </p>
            </div>
            <div className="space-y-4">
              <div className="text-3xl font-black">Custom Pricing</div>
              <Link href="/dashboard">
                <button className="w-full py-2.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-xs font-bold text-slate-300 transition">
                  Contact Enterprise Sales
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">MEDIOPS AI</span>
            <span>© {new Date().getFullYear()} All Rights Reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition">Privacy Shield</a>
            <a href="#" className="hover:text-slate-400 transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
