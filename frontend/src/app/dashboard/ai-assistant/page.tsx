"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSimulation, ChatMessage } from "@/context/SimulationContext";
import { Bot, User, Send, Sparkles, Database, BarChart3, HelpCircle } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function AIAssistantPage() {
  const { chatHistory, sendChatMessage } = useSimulation();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    sendChatMessage(text);
    setInput("");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const activeSuggestions = chatHistory[chatHistory.length - 1]?.suggestions || [
    "Summarize today's ER congestion metrics",
    "What is the forecasted bed occupancy for Friday?",
    "Explain the warning alert regarding Epinephrine",
    "Generate the Executive Operations summary"
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:grid lg:grid-cols-12 gap-6 pb-6">
      {/* Chat Area */}
      <div className="lg:col-span-8 p-5 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col justify-between h-full overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2">
            <Bot className="text-cyan-400" size={18} />
            <div>
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">MediOps Copilot</h3>
              <span className="text-[9px] font-semibold text-slate-500 font-mono">Active Model: Deep Clinical LLM v2</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/20 px-2 py-0.5 border border-cyan-500/20 rounded">
            Online
          </span>
        </div>

        {/* Message bubbles */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
          {chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                msg.sender === "user" ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-cyan-950/30 border-cyan-500/20 text-cyan-400"
              }`}>
                {msg.sender === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>

              {/* Message bubble core */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                msg.sender === "user" ? "bg-slate-900/80 border-slate-800 text-slate-200" : "bg-slate-950/40 border-slate-900 text-slate-300"
              }`}>
                {/* Text Content */}
                <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {/* Render in-chat tables if present */}
                {msg.tableData && (
                  <div className="border border-slate-900 rounded-lg overflow-x-auto text-[10px] font-mono bg-slate-950/60 max-w-full">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-900 bg-slate-900/30">
                          {Object.keys(msg.tableData[0]).map((key) => (
                            <th key={key} className="p-2 text-slate-500">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {msg.tableData.map((row, idx) => (
                          <tr key={idx} className="border-b border-slate-900/50 hover:bg-slate-900/10">
                            {Object.values(row).map((val: any, i) => (
                              <td key={i} className="p-2 text-slate-300">{val}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Render in-chat charts if present */}
                {msg.chartData && (
                  <div className="border border-slate-900 rounded-lg p-3 bg-slate-950/60 h-44 w-72 md:w-96 text-[9px] font-mono">
                    <div className="text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                      Predictive Admissions Chart
                    </div>
                    <ResponsiveContainer width="100%" height="80%">
                      <BarChart data={msg.chartData}>
                        <XAxis dataKey="day" stroke="#64748b" tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1d2939" }} />
                        <Bar dataKey="admissions" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          {/* Quick chip responses */}
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {activeSuggestions.slice(0, 3).map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                className="px-3 py-1 rounded-full border border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700 text-[10px] font-semibold text-slate-400 hover:text-slate-200 transition shrink-0"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              placeholder="Ask Copilot: 'What is the forecasted occupancy?' or 'Summarize ER stats'..."
              className="h-10 flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 transition font-medium"
            />
            <button
              onClick={() => handleSend(input)}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white flex items-center justify-center transition shadow-lg shadow-cyan-500/20 shrink-0"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Auxiliary Help Sidepanel */}
      <div className="lg:col-span-4 p-5 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col justify-between h-full">
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">Suggested Queries</h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Explore the full range of operations assistant features.</p>
          </div>

          <div className="space-y-4 text-xs font-medium text-slate-400">
            <div className="flex gap-3 items-start">
              <div className="p-1 rounded bg-slate-900 border border-slate-800 text-cyan-400 shrink-0">
                <Database size={14} />
              </div>
              <div>
                <span className="block text-slate-300 font-semibold">Real-Time DB Scans</span>
                <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Ask questions targeting patient counts, specific names, or active bed assignments.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="p-1 rounded bg-slate-900 border border-slate-800 text-purple-400 shrink-0">
                <BarChart3 size={14} />
              </div>
              <div>
                <span className="block text-slate-300 font-semibold">Render In-Chat Analytics</span>
                <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Ask for forecasted throughputs or inventory projections to render dynamic charts.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="p-1 rounded bg-slate-900 border border-slate-800 text-yellow-400 shrink-0">
                <HelpCircle size={14} />
              </div>
              <div>
                <span className="block text-slate-300 font-semibold">Operational Explanations</span>
                <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Query warning alerts or recommendations to explain underlying clinical factors.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/80">
          <button
            onClick={() => handleSend("Generate the Executive Operations summary")}
            className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold tracking-wider text-slate-300 uppercase transition flex items-center justify-center gap-1.5"
          >
            <Sparkles size={12} className="text-cyan-400" /> Auto-Generate Executive Summary
          </button>
        </div>
      </div>
    </div>
  );
}
