"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Types
export type UserRole = "Executive Director" | "Chief Medical Officer" | "Operations Manager";
export type SimulationState = "Normal Operations" | "Trauma ER Surge" | "ICU Saturation" | "Pandemic Load" | "Staffing Shortage" | "Resource Crisis";

export interface KPICardData {
  title: string;
  value: string | number;
  trend: number; // percentage change, e.g., +4.2 or -2.1
  trendDirection: "up" | "down" | "neutral";
  sparkline: number[];
  icon: string;
  glowColor: "cyan" | "purple" | "red" | "green" | "yellow";
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  department: string;
  severity: "Critical" | "Severe" | "Moderate" | "Mild";
  waitTime: number; // minutes
  status: "Admitted" | "In Triage" | "Awaiting Doctor" | "Discharged";
  bedNumber?: string;
  admittedAt: string;
}

export interface Anomaly {
  id: string;
  type: "Billing Pattern" | "Patient Surge" | "Staffing Deficit" | "ICU Overload" | "Unusual Wait Spike" | "Consumables Depletion";
  severity: "Critical" | "High" | "Medium";
  message: string;
  timestamp: string;
  status: "Active" | "Investigating" | "Resolved";
  impactScore: number; // 1-100
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: "Critical" | "High" | "Medium";
  confidence: number; // percentage
  factors: string[];
  operationalImpact: string;
  actionLabel: string;
  status: "Pending" | "Approved" | "Dismissed";
}

export interface ResourceItem {
  id: string;
  name: string;
  category: "Beds" | "Equipment" | "Consumables" | "Staff";
  total: number;
  allocated: number;
  unit: string;
  history: number[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userRole: UserRole;
  action: string;
  details: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  suggestions?: string[];
  tableData?: any[];
  chartData?: any[];
}

export interface Ambulance {
  id: string;
  code: string;
  status: "Dispatched" | "En Route to Scene" | "Returning to Hospital" | "Available";
  eta: number; // minutes
  patientSeverity: "Critical" | "Severe" | "Mild" | "None";
  coordinates: { x: number; y: number }; // Relative coordinates for visual maps
}

interface SimulationContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  kpis: { [key in UserRole]: KPICardData[] };
  patients: Patient[];
  anomalies: Anomaly[];
  recommendations: Recommendation[];
  resources: ResourceItem[];
  auditLogs: AuditLog[];
  ambulances: Ambulance[];
  chatHistory: ChatMessage[];
  notifications: { id: string; text: string; severity: string; time: string; read: boolean }[];
  isBackendConnected: boolean;
  simulationState: SimulationState;
  setSimulationState: (state: SimulationState) => void;
  availableSimulationStates: SimulationState[];
  addAuditLog: (action: string, details: string) => void;
  approveRecommendation: (id: string) => void;
  dismissRecommendation: (id: string) => void;
  resolveAnomaly: (id: string) => void;
  triggerManualSpike: (type: "ER_SURGE" | "ICU_OVERLOAD" | "STAFF_SHORTAGE") => void;
  sendChatMessage: (text: string) => void;
  clearNotifications: () => void;
  markNotificationRead: (id: string) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) throw new Error("useSimulation must be used within a SimulationProvider");
  return context;
};

export const SimulationProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRoleState] = useState<UserRole>("Executive Director");
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [simulationState, setSimulationStateInternal] = useState<SimulationState>("Normal Operations");
  const availableSimulationStates: SimulationState[] = ["Normal Operations", "Trauma ER Surge", "ICU Saturation", "Pandemic Load", "Staffing Shortage", "Resource Crisis"];

  // Set up states
  const [patients, setPatients] = useState<Patient[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Function to set role and log it
  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    addAuditLog("Role Switched", `User switched view to ${newRole}`);
  };

  // Add an audit log entry
  const addAuditLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `LOG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: new Date().toLocaleTimeString(),
      userRole: role,
      action,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Helper to fetch backend data
  const refetchAllBackendData = async () => {
    try {
      const [resRes, recRes, logRes, anmRes, patRes, stateRes] = await Promise.all([
        fetch("http://localhost:8000/api/resources"),
        fetch("http://localhost:8000/api/recommendations"),
        fetch("http://localhost:8000/api/audit-logs"),
        fetch("http://localhost:8000/api/anomalies"),
        fetch("http://localhost:8000/api/patients"),
        fetch("http://localhost:8000/api/simulation/state"),
      ]);
      
      if (resRes.ok) {
        const resData = await resRes.json();
        setResources((prev) => 
          resData.map((r: any) => {
            const prevItem = prev.find((pi) => pi.id === r.id);
            return {
              ...r,
              history: prevItem?.history || [r.allocated, r.allocated, r.allocated, r.allocated, r.allocated, r.allocated, r.allocated]
            };
          })
        );
      }
      
      if (recRes.ok) {
        const recData = await recRes.json();
        setRecommendations(recData.map((r: any) => ({
          ...r,
          factors: typeof r.factors === 'string' ? r.factors.split(',') : r.factors
        })));
      }
      
      if (logRes.ok) {
        const logData = await logRes.json();
        setAuditLogs(logData.map((l: any) => ({
          id: `LOG-${l.id}`,
          timestamp: new Date(l.timestamp).toLocaleTimeString(),
          userRole: l.user_role as UserRole,
          action: l.action,
          details: l.details
        })));
      }

      if (anmRes.ok) {
        const anmData = await anmRes.json();
        setAnomalies(anmData.map((a: any) => ({
          id: a.id,
          type: a.type,
          severity: a.severity,
          message: a.message,
          timestamp: new Date(a.timestamp).toLocaleTimeString().substring(0, 5) + " " + new Date(a.timestamp).toLocaleTimeString().substring(-2),
          status: a.status,
          impactScore: a.impact_score
        })));
      }

      if (patRes.ok) {
        const patData = await patRes.json();
        setPatients(patData);
      }

      if (stateRes.ok) {
        const stateData = await stateRes.json();
        setSimulationStateInternal(stateData.state);
      }
    } catch (err) {
      console.error("Error refetching data:", err);
    }
  };

  // Set simulation state (frontend -> backend sync)
  const setSimulationState = async (newState: SimulationState) => {
    setSimulationStateInternal(newState);
    if (isBackendConnected) {
      try {
        const res = await fetch("http://localhost:8000/api/simulation/state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: newState })
        });
        if (res.ok) {
          addAuditLog("Simulation State Changed", `Changed simulation state to ${newState}`);
          await refetchAllBackendData();
        }
      } catch (err) {
        console.error("Error setting simulation state on backend", err);
      }
    } else {
      addAuditLog("Simulation State Changed (Simulated)", `Changed simulation state to ${newState}`);
      setNotifications((prev) => [
        { id: Math.random().toString(), text: `Simulation state changed to ${newState}`, severity: "info", time: "Just now", read: false },
        ...prev
      ]);
    }
  };

  // Seed Data Initializer
  useEffect(() => {
    // Initial patients seed
    const initialPatients: Patient[] = [
      { id: "P-101", name: "David Miller", age: 52, gender: "Male", department: "ICU", severity: "Critical", waitTime: 0, status: "Admitted", bedNumber: "ICU-B3", admittedAt: "10:15 AM" },
      { id: "P-102", name: "Sarah Connor", age: 41, gender: "Female", department: "Emergency", severity: "Severe", waitTime: 18, status: "Awaiting Doctor", admittedAt: "1:45 PM" },
      { id: "P-103", name: "Robert Chen", age: 67, gender: "Male", department: "Cardiology", severity: "Critical", waitTime: 5, status: "Admitted", bedNumber: "CARD-12", admittedAt: "11:30 AM" },
      { id: "P-104", name: "Elena Rostova", age: 29, gender: "Female", department: "Emergency", severity: "Moderate", waitTime: 42, status: "In Triage", admittedAt: "2:10 PM" },
      { id: "P-105", name: "James Wilson", age: 73, gender: "Male", department: "General Medicine", severity: "Mild", waitTime: 75, status: "Awaiting Doctor", admittedAt: "12:05 PM" },
      { id: "P-106", name: "Michael Vance", age: 58, gender: "Male", department: "ICU", severity: "Critical", waitTime: 0, status: "Admitted", bedNumber: "ICU-B1", admittedAt: "08:20 AM" },
      { id: "P-107", name: "Lisa Alvarez", age: 34, gender: "Female", department: "Pediatrics", severity: "Moderate", waitTime: 25, status: "Awaiting Doctor", admittedAt: "2:30 PM" },
      { id: "P-108", name: "Arthur Shelby", age: 46, gender: "Male", department: "Emergency", severity: "Severe", waitTime: 12, status: "In Triage", admittedAt: "2:22 PM" }
    ];
    setPatients(initialPatients);

    // Initial anomalies seed
    const initialAnomalies: Anomaly[] = [
      { id: "ANM-204", type: "Billing Pattern", severity: "Medium", message: "Dual submission flag for patient insurance ref P-10903", timestamp: "01:14 PM", status: "Active", impactScore: 42 },
      { id: "ANM-205", type: "ICU Overload", severity: "Critical", message: "ICU capacity reached 95% limit. Expected surge in ER transfers.", timestamp: "02:00 PM", status: "Active", impactScore: 92 },
      { id: "ANM-206", type: "Unusual Wait Spike", severity: "High", message: "Emergency Department wait times spiked to 65 mins average.", timestamp: "02:15 PM", status: "Active", impactScore: 78 }
    ];
    setAnomalies(initialAnomalies);

    // Initial recommendations seed
    const initialRecommendations: Recommendation[] = [
      {
        id: "REC-401",
        title: "Deploy Additional Staff to ED",
        description: "Deploy 2 additional nurses and 1 physician to the Emergency Department from General Wards.",
        priority: "Critical",
        confidence: 94,
        factors: ["ED Wait times > 60 mins", "3 incoming ambulances", "Staff utilization in General Wards is at 62%"],
        operationalImpact: "Reduces ER average wait times by an estimated 18 minutes; rebalances ward staffing ratios to 82%.",
        actionLabel: "Reallocate Staff",
        status: "Pending"
      },
      {
        id: "REC-402",
        title: "Initiate ICU Bed Cleanup Protocols",
        description: "Trigger rapid discharge review for 3 patients in General ICU who meet the step-down criteria.",
        priority: "High",
        confidence: 89,
        factors: ["ICU occupancy at 95%", "2 critical cases in ER waiting for ICU beds", "Average length of stay of candidate patients is +12% vs. norm"],
        operationalImpact: "Frees up 2 ICU beds within 3 hours, mitigating ICU congestion risk.",
        actionLabel: "Initiate Discharges",
        status: "Pending"
      },
      {
        id: "REC-403",
        title: "Restock Epinephrine Stocks in Pharmacy",
        description: "Approve emergency purchase order of Epinephrine vials to counter inventory run-down.",
        priority: "Medium",
        confidence: 91,
        factors: ["Epinephrine stock level at 12%", "Daily burn rate increased by 28%", "Supplier delivery lead time is 24 hours"],
        operationalImpact: "Prevents supply stockout within the next 18 hours.",
        actionLabel: "Auto-Order Supply",
        status: "Pending"
      }
    ];
    setRecommendations(initialRecommendations);

    // Initial resources seed
    const initialResources: ResourceItem[] = [
      { id: "RES-01", name: "ICU Beds", category: "Beds", total: 40, allocated: 38, unit: "Beds", history: [32, 34, 35, 37, 36, 38, 38] },
      { id: "RES-02", name: "Ventilators", category: "Equipment", total: 30, allocated: 22, unit: "Units", history: [18, 19, 21, 22, 20, 21, 22] },
      { id: "RES-03", name: "Oxygen Supply", category: "Consumables", total: 1000, allocated: 650, unit: "Liters", history: [580, 600, 610, 620, 640, 660, 650] },
      { id: "RES-04", name: "Epinephrine Vials", category: "Consumables", total: 500, allocated: 440, unit: "Vials", history: [480, 475, 470, 460, 455, 450, 440] },
      { id: "RES-05", name: "Emergency Staff (Active)", category: "Staff", total: 24, allocated: 22, unit: "Nurses/MDs", history: [18, 20, 20, 22, 22, 22, 22] },
      { id: "RES-06", name: "General Wards Beds", category: "Beds", total: 200, allocated: 154, unit: "Beds", history: [142, 145, 149, 150, 153, 154, 154] }
    ];
    setResources(initialResources);

    // Initial ambulances seed
    const initialAmbulances: Ambulance[] = [
      { id: "AMB-01", code: "MED-ALPHA", status: "Returning to Hospital", eta: 4, patientSeverity: "Severe", coordinates: { x: 35, y: 42 } },
      { id: "AMB-02", code: "MED-BETA", status: "En Route to Scene", eta: 9, patientSeverity: "None", coordinates: { x: 15, y: 72 } },
      { id: "AMB-03", code: "MED-GAMMA", status: "Dispatched", eta: 14, patientSeverity: "Critical", coordinates: { x: 62, y: 22 } },
      { id: "AMB-04", code: "MED-DELTA", status: "Available", eta: 0, patientSeverity: "None", coordinates: { x: 50, y: 50 } }
    ];
    setAmbulances(initialAmbulances);

    // Initial audit logs seed
    const initialLogs: AuditLog[] = [
      { id: "LOG-INIT", timestamp: "02:10 PM", userRole: "Operations Manager", action: "Inventory Checked", details: "Oxygen tanks verified at 65% capacity." },
      { id: "LOG-SYS", timestamp: "02:00 PM", userRole: "Operations Manager", action: "Anomaly Logged", details: "ICU occupancy crossed threshold limit of 90%." }
    ];
    setAuditLogs(initialLogs);

    // Initial notifications seed
    const initialNotifications = [
      { id: "1", text: "Critical ICU capacity alert: Occupancy at 95%.", severity: "critical", time: "5m ago", read: false },
      { id: "2", text: "Emergency wait times exceeded 60m threshold.", severity: "high", time: "15m ago", read: false },
      { id: "3", text: "Low stock warning: Epinephrine vials at 12% capacity.", severity: "medium", time: "20m ago", read: false }
    ];
    setNotifications(initialNotifications);

    // Chat assistant initial greeting
    setChatHistory([
      {
        id: "chat-0",
        sender: "ai",
        text: "System Online. Welcome to MediOps AI Decision Intelligence Assistant. I have live access to current patient flows, resource utilization, staffing loads, and predictive forecasts. How can I help optimize operations today?",
        timestamp: new Date().toLocaleTimeString(),
        suggestions: [
          "Summarize today's ER congestion metrics",
          "What is the forecasted bed occupancy for Friday?",
          "Explain the warning alert regarding Epinephrine",
          "Generate the Executive Operations summary"
        ]
      }
    ]);

    // Check if FastAPI backend is online
    const checkBackend = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/health", { signal: AbortSignal.timeout(1000) });
        if (res.ok) {
          setIsBackendConnected(true);
          addAuditLog("Backend Connection", "Successfully connected to FastAPI production server.");
          await refetchAllBackendData();
        }
      } catch (err) {
        setIsBackendConnected(false);
      }
    };
    checkBackend();
  }, []);

  // WebSocket subscription for telemetry updates
  useEffect(() => {
    if (!isBackendConnected) return;

    let ws: WebSocket;
    let reconnectTimeout: any;

    const connectWS = () => {
      // Point to new standard live endpoint
      ws = new WebSocket("ws://localhost:8000/ws/live");
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.simulationState) {
            setSimulationStateInternal(data.simulationState);
          }

          if (data.patients) {
            setPatients(data.patients.map((p: any) => ({
              id: p.id,
              name: p.name,
              age: p.age,
              gender: p.gender,
              department: p.department,
              severity: p.severity,
              waitTime: p.waitTime,
              status: p.status,
              bedNumber: p.bedNumber || undefined,
              admittedAt: p.admittedAt
            })));
          }

          if (data.resources) {
            setResources((prev) => 
              data.resources.map((r: any) => {
                const prevItem = prev.find((pi) => pi.id === r.id);
                const history = prevItem 
                  ? [...prevItem.history.slice(1), r.allocated] 
                  : [r.allocated, r.allocated, r.allocated, r.allocated, r.allocated, r.allocated, r.allocated];
                return { ...r, history };
              })
            );
          }
          
          if (data.anomalies) {
            setAnomalies(data.anomalies.map((a: any) => ({
              id: a.id,
              type: a.type,
              severity: a.severity,
              message: a.message,
              timestamp: a.timestamp,
              status: a.status,
              impactScore: a.impactScore
            })));
          }
          
          if (data.ambulances) {
            setAmbulances(data.ambulances.map((amb: any) => ({
              id: amb.id,
              code: amb.code,
              status: amb.status,
              eta: amb.eta,
              patientSeverity: amb.patientSeverity,
              coordinates: { x: amb.x, y: amb.y }
            })));
          }
        } catch (err) {
          console.error("WebSocket telemetry message parse error:", err);
        }
      };

      ws.onerror = (err) => {
        console.warn("WebSocket telemetry error, reconnecting in 3s...", err);
      };

      ws.onclose = () => {
        reconnectTimeout = setTimeout(() => {
          if (isBackendConnected) connectWS();
        }, 3000);
      };
    };

    connectWS();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, [isBackendConnected]);

  // KPIs definition (dynamically derived from state)
  const getKPIs = (): { [key in UserRole]: KPICardData[] } => {
    // Determine active metrics
    const totalPatientsCount = patients.length + 154; // active + seeded rest
    const icuBeds = resources.find(r => r.id === "RES-01");
    const icuOccupancy = icuBeds ? Math.round((icuBeds.allocated / icuBeds.total) * 100) : 95;
    
    const erStaff = resources.find(r => r.id === "RES-05");
    const staffUtilization = erStaff ? Math.round((erStaff.allocated / erStaff.total) * 100) : 85;

    const currentWait = anomalies.some(a => a.type === "Unusual Wait Spike") ? 65 : 42;
    const readmissionRate = role === "Chief Medical Officer" ? 12.8 : 14.2; // slight shift depending on focus

    return {
      "Executive Director": [
        { title: "Total Hospital Patients", value: totalPatientsCount, trend: 3.2, trendDirection: "up", sparkline: [142, 145, 148, 150, 154, 158, 162], icon: "Users", glowColor: "cyan" },
        { title: "Staff Utilization Rate", value: `${staffUtilization}%`, trend: 4.8, trendDirection: "up", sparkline: [78, 80, 81, 83, 85, 88, 91], icon: "Award", glowColor: "purple" },
        { title: "Operating Cost Ratio", value: "91.2%", trend: -1.5, trendDirection: "down", sparkline: [93.5, 93.1, 92.8, 92.4, 91.9, 91.5, 91.2], icon: "DollarSign", glowColor: "green" },
        { title: "Patient Satisfaction", value: "4.7 / 5", trend: 0.8, trendDirection: "up", sparkline: [4.5, 4.6, 4.6, 4.7, 4.7, 4.7, 4.7], icon: "Smile", glowColor: "green" }
      ],
      "Chief Medical Officer": [
        { title: "ICU Occupancy %", value: `${icuOccupancy}%`, trend: 5.4, trendDirection: "up", sparkline: [88, 90, 92, 92, 93, 95, 95], icon: "Activity", glowColor: "red" },
        { title: "Readmission Rate", value: `${readmissionRate}%`, trend: -2.3, trendDirection: "down", sparkline: [15.1, 14.8, 14.5, 14.2, 13.9, 13.5, 12.8], icon: "RotateCcw", glowColor: "cyan" },
        { title: "Emergency Load Status", value: "Critical", trend: 12.5, trendDirection: "up", sparkline: [45, 52, 60, 68, 75, 82, 88], icon: "Zap", glowColor: "red" },
        { title: "Avg Care Quality Index", value: "96.4", trend: 1.1, trendDirection: "up", sparkline: [94.8, 95.1, 95.5, 95.9, 96.0, 96.2, 96.4], icon: "Heart", glowColor: "green" }
      ],
      "Operations Manager": [
        { title: "Avg ER Wait Time", value: `${currentWait}m`, trend: 18.2, trendDirection: "up", sparkline: [32, 38, 42, 48, 55, 60, 65], icon: "Clock", glowColor: "red" },
        { title: "Bed Availability", value: `${240 - (38 + 154)} / 240`, trend: -8.5, trendDirection: "down", sparkline: [62, 58, 54, 52, 49, 48, 48], icon: "Bed", glowColor: "yellow" },
        { title: "Active Emergencies", value: patients.filter(p => p.department === "Emergency").length, trend: 15.0, trendDirection: "up", sparkline: [2, 3, 4, 3, 5, 5, 8], icon: "AlertTriangle", glowColor: "red" },
        { title: "Resource Health Index", value: "82.5%", trend: -0.4, trendDirection: "down", sparkline: [84.2, 83.9, 83.5, 83.1, 82.9, 82.7, 82.5], icon: "Shield", glowColor: "purple" }
      ]
    };
  };

  // Recommendations approval workflow
  const approveRecommendation = async (id: string) => {
    const rec = recommendations.find((r) => r.id === id);
    if (!rec) return;

    if (isBackendConnected) {
      try {
        const res = await fetch(`http://localhost:8000/api/recommendations/${id}/approve?role=${encodeURIComponent(role)}`, {
          method: "POST"
        });
        if (res.ok) {
          addAuditLog("Approved Recommendation", `User approved '${rec.title}'`);
          setNotifications((prev) => [
            {
              id: Math.random().toString(),
              text: `Executed operational command: ${rec.title}`,
              severity: "success",
              time: "Just now",
              read: false
            },
            ...prev
          ]);
          await refetchAllBackendData();
        }
      } catch (err) {
        console.error("Error approving recommendation on backend", err);
      }
      return;
    }

    // Apply simulation effects based on recommendation type (Fallback mode)
    if (id === "REC-401") {
      // Reallocate ER staff
      setResources((prev) =>
        prev.map((r) => {
          if (r.id === "RES-05") return { ...r, allocated: Math.min(r.total, r.allocated + 3) }; // Add staff
          if (r.id === "RES-06") return { ...r, allocated: Math.max(0, r.allocated - 3) }; // Pull from Wards
          return r;
        })
      );
      // Resolve ER wait spike anomaly
      setAnomalies((prev) =>
        prev.map((a) => (a.type === "Unusual Wait Spike" ? { ...a, status: "Resolved" as const } : a))
      );
    } else if (id === "REC-402") {
      // ICU bed cleanup
      setResources((prev) =>
        prev.map((r) => (r.id === "RES-01" ? { ...r, allocated: Math.max(0, r.allocated - 3) } : r))
      );
      // Resolve ICU Overload anomaly
      setAnomalies((prev) =>
        prev.map((a) => (a.type === "ICU Overload" ? { ...a, status: "Resolved" as const } : a))
      );
    } else if (id === "REC-403") {
      // Order epinephrine
      setResources((prev) =>
        prev.map((r) => (r.id === "RES-04" ? { ...r, allocated: r.total } : r))
      );
    }

    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Approved" as const } : r))
    );

    // Create Notification and Audit Log
    addAuditLog("Approved Recommendation", `User approved '${rec.title}'`);
    setNotifications((prev) => [
      {
        id: Math.random().toString(),
        text: `Executed operational command: ${rec.title}`,
        severity: "success",
        time: "Just now",
        read: false
      },
      ...prev
    ]);
  };

  const dismissRecommendation = async (id: string) => {
    const rec = recommendations.find((r) => r.id === id);
    if (!rec) return;

    if (isBackendConnected) {
      try {
        const res = await fetch(`http://localhost:8000/api/recommendations/${id}/dismiss?role=${encodeURIComponent(role)}`, {
          method: "POST"
        });
        if (res.ok) {
          addAuditLog("Dismissed Recommendation", `User dismissed recommendation '${rec.title}'`);
          await refetchAllBackendData();
        }
      } catch (err) {
        console.error("Error dismissing recommendation on backend", err);
      }
      return;
    }

    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Dismissed" as const } : r))
    );

    addAuditLog("Dismissed Recommendation", `User dismissed recommendation '${rec.title}'`);
  };

  const resolveAnomaly = async (id: string) => {
    const anm = anomalies.find((a) => a.id === id);
    if (!anm) return;

    if (isBackendConnected) {
      try {
        const res = await fetch(`http://localhost:8000/api/anomalies/${id}/resolve`, {
          method: "POST"
        });
        if (res.ok) {
          addAuditLog("Resolved Anomaly", `Investigated and flagged '${anm.type}' as resolved.`);
          await refetchAllBackendData();
        }
      } catch (err) {
        console.error("Error resolving anomaly on backend", err);
      }
      return;
    }

    setAnomalies((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Resolved" as const } : a))
    );

    addAuditLog("Resolved Anomaly", `Investigated and flagged '${anm.type}' as resolved.`);
  };

  const triggerManualSpike = async (type: "ER_SURGE" | "ICU_OVERLOAD" | "STAFF_SHORTAGE") => {
    if (isBackendConnected) {
      try {
        const res = await fetch("http://localhost:8000/api/simulation/spike", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type })
        });
        if (res.ok) {
          setNotifications((prev) => [
            { id: Math.random().toString(), text: `Injected simulator event: ${type} into database.`, severity: "info", time: "Just now", read: false },
            ...prev
          ]);
          await refetchAllBackendData();
        }
      } catch (err) {
        console.error("Error triggering manual spike on backend", err);
      }
      return;
    }

    if (type === "ER_SURGE") {
      setSimulationStateInternal("Trauma ER Surge");
      // Push 4 critical emergency patients
      const newPatients: Patient[] = [
        { id: "P-120", name: "Frank Miller (Emergency Spike)", age: 31, gender: "Male", department: "Emergency", severity: "Critical", waitTime: 0, status: "Awaiting Doctor", admittedAt: "Just Now" },
        { id: "P-121", name: "Claire Redfield (Emergency Spike)", age: 24, gender: "Female", department: "Emergency", severity: "Severe", waitTime: 2, status: "In Triage", admittedAt: "Just Now" },
      ];
      setPatients((prev) => [...newPatients, ...prev]);

      // Add Anomaly
      const newAnomaly: Anomaly = {
        id: `ANM-${Math.floor(200 + Math.random() * 800)}`,
        type: "Patient Surge",
        severity: "Critical",
        message: "Severe Multi-Vehicle Trauma inflow: ER admissions spiked by +40% in last 10 mins.",
        timestamp: new Date().toLocaleTimeString().substring(0, 5) + " " + new Date().toLocaleTimeString().substring(-2),
        status: "Active",
        impactScore: 95
      };
      setAnomalies((prev) => [newAnomaly, ...prev]);

      // Add Recommendation
      const newRec: Recommendation = {
        id: `REC-${Math.floor(400 + Math.random() * 600)}`,
        title: "Activate ER Mass Casualty Protocol",
        description: "Redirect non-trauma inbound ambulances to Mercy General and open ER Surge Unit B.",
        priority: "Critical",
        confidence: 97,
        factors: ["2 multi-trauma code reds active", "ER waiting lobby capacity exceeded", "FastAPI prediction expects 12 additional arrivals"],
        operationalImpact: "Distributes acute trauma load, lowers congestion threat, reduces secondary wait indicators by 30%.",
        actionLabel: "Activate Surge Plan",
        status: "Pending"
      };
      setRecommendations((prev) => [newRec, ...prev]);

      addAuditLog("ER Surge Triggered", "Manual simulator event: ER mass casualty incident surge injected.");
      setNotifications((prev) => [
        { id: Math.random().toString(), text: "MASS SURGE: ER admissions spiking rapidly!", severity: "critical", time: "Just now", read: false },
        ...prev
      ]);
    } else if (type === "ICU_OVERLOAD") {
      setSimulationStateInternal("ICU Saturation");
      setResources((prev) =>
        prev.map((r) => (r.id === "RES-01" ? { ...r, allocated: r.total } : r)) // Full ICU beds
      );

      const newAnomaly: Anomaly = {
        id: `ANM-${Math.floor(200 + Math.random() * 800)}`,
        type: "ICU Overload",
        severity: "Critical",
        message: "ICU Unit at 100% capacity. Zero available emergency reserve beds.",
        timestamp: new Date().toLocaleTimeString().substring(0, 5) + " " + new Date().toLocaleTimeString().substring(-2),
        status: "Active",
        impactScore: 99
      };
      setAnomalies((prev) => [newAnomaly, ...prev]);

      addAuditLog("ICU Overload Triggered", "Manual simulator event: ICU capacity spiked to 100%.");
      setNotifications((prev) => [
        { id: Math.random().toString(), text: "ICU Bed Capacity exhausted (100% load).", severity: "critical", time: "Just now", read: false },
        ...prev
      ]);
    } else if (type === "STAFF_SHORTAGE") {
      setSimulationStateInternal("Staffing Shortage");
      setResources((prev) =>
        prev.map((r) => (r.id === "RES-05" ? { ...r, allocated: Math.min(r.total, 8) } : r)) // Deep drop in available staff
      );

      const newAnomaly: Anomaly = {
        id: `ANM-${Math.floor(200 + Math.random() * 800)}`,
        type: "Staffing Deficit",
        severity: "High",
        message: "High staff call-outs in Pediatric unit. Under-staffing ratio detected.",
        timestamp: new Date().toLocaleTimeString().substring(0, 5) + " " + new Date().toLocaleTimeString().substring(-2),
        status: "Active",
        impactScore: 82
      };
      setAnomalies((prev) => [newAnomaly, ...prev]);

      addAuditLog("Staff Shortage Triggered", "Manual simulator event: Nurse shortage simulation injected.");
      setNotifications((prev) => [
        { id: Math.random().toString(), text: "Critical understaffing detected in Pediatric & General Medicine wards.", severity: "high", time: "Just now", read: false },
        ...prev
      ]);
    }
  };

  // AI Assistant chat handler
  const sendChatMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `chat-${Math.random()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatHistory((prev) => [...prev, userMsg]);

    if (isBackendConnected) {
      try {
        const res = await fetch("http://localhost:8000/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        });
        if (res.ok) {
          const aiData = await res.json();
          const aiMsg: ChatMessage = {
            id: `chat-${Math.random()}`,
            sender: "ai",
            text: aiData.text,
            timestamp: new Date().toLocaleTimeString(),
            chartData: aiData.chartData || undefined,
            tableData: aiData.tableData || undefined
          };
          setChatHistory((prev) => [...prev, aiMsg]);
        }
      } catch (err) {
        console.error("Error sending chat to backend", err);
      }
      return;
    }

    // Simulated responses containing actual data (Fallback mode)
    setTimeout(() => {
      let replyText = "";
      let chartData: any[] | undefined = undefined;
      let tableData: any[] | undefined = undefined;

      const lowerText = text.toLowerCase();
      if (lowerText.includes("er") || lowerText.includes("emergency") || lowerText.includes("congestion") || lowerText.includes("patients") || lowerText.includes("triage")) {
        const erPatients = patients.filter(p => p.department === "Emergency");
        replyText = `Analysis of **Emergency Department**: Currently there are **${erPatients.length} active patients** in triage/waiting. The average wait time is **${anomalies.some(a => a.type === "Unusual Wait Spike") ? "65" : "42"} minutes**, which exceeds the baseline targets by 15%. I recommend reallocating staff from the General Wards immediately to balance this out.`;
        tableData = erPatients.map(p => ({ ID: p.id, Name: p.name, Severity: p.severity, Wait: `${p.waitTime}m`, Status: p.status }));
      } else if (lowerText.includes("forecast") || lowerText.includes("friday") || lowerText.includes("occupancy")) {
        replyText = "Based on our predictive models, we anticipate a **15-20% surge in ICU & Emergency admissions** starting Friday evening around 18:00 due to weather conditions and historical patterns. Total admissions are projected to peak at **178 patients**. Confidence interval is 92%.";
        chartData = [
          { day: "Wed (Hist)", admissions: 145 },
          { day: "Thu (Hist)", admissions: 154 },
          { day: "Fri (Forecast)", admissions: 178, limit: 170 },
          { day: "Sat (Forecast)", admissions: 165 },
          { day: "Sun (Forecast)", admissions: 148 }
        ];
      } else if (lowerText.includes("epinephrine") || lowerText.includes("stock") || lowerText.includes("pharmacy")) {
        const epinephrine = resources.find(r => r.id === "RES-04");
        replyText = `**Supply Alert**: Epinephrine vials are at **${epinephrine ? Math.round((epinephrine.allocated / epinephrine.total) * 100) : 12}% stock level** (${epinephrine?.allocated} remaining). Current burn rate is elevated at 14 vials/hour. Auto-replenishment order has been prepared and is pending approval in the Decision Intelligence panel.`;
      } else if (lowerText.includes("summary") || lowerText.includes("executive") || lowerText.includes("report")) {
        replyText = `### Executive Summary (Generated ${new Date().toLocaleDateString()})
*   **Total Patients**: ${patients.length + 154} active.
*   **ICU Occupancy**: ${resources.find(r => r.id === "RES-01")?.allocated} of ${resources.find(r => r.id === "RES-01")?.total} beds occupied (${Math.round((resources.find(r => r.id === "RES-01")?.allocated || 0) / (resources.find(r => r.id === "RES-01")?.total || 1) * 100)}%).
*   **Core Issues**: High ER congestion, low stocking in critical vials.
*   **Action Plan**: Approve pending reallocations (staff + inventory orders) in the Decision AI panel.`;
      } else if (lowerText.includes("simulation") || lowerText.includes("state") || lowerText.includes("mode") || lowerText.includes("scenario")) {
        replyText = `### Operations Simulation State\nThe current active scenario mode is **${simulationState}**. Changing states modulates live clinical patient intake volumes, staffing resource depletion, and pharmaceutical consumables burn rates.`;
      } else {
        replyText = "I have scanned the hospital database. Currently, the most critical bottleneck is **ICU Bed Shortages** and **Emergency Wait Times**. You have 3 pending AI recommendations that can optimize these metrics. Would you like me to detail staff allocations or pharmacy replenishment details?";
      }

      const aiMsg: ChatMessage = {
        id: `chat-${Math.random()}`,
        sender: "ai",
        text: replyText,
        timestamp: new Date().toLocaleTimeString(),
        chartData,
        tableData
      };
      setChatHistory((prev) => [...prev, aiMsg]);
    }, 1000);
  };

  // Notification methods
  const clearNotifications = () => {
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  // Real-time loop simulating active updates (WebSocket emulation)
  useEffect(() => {
    if (isBackendConnected) return;
    const timer = setInterval(() => {
      // 1. Fluctuates active ambulance ETAs & coordinates
      setAmbulances((prev) =>
        prev.map((amb) => {
          if (amb.status === "Available") return amb;
          const newEta = Math.max(0, amb.eta - 1);
          let newStatus: Ambulance["status"] = amb.status;
          let newSeverity: Ambulance["patientSeverity"] = amb.patientSeverity;
          let newEtaVal = newEta;
          
          if (newEta === 0) {
            newStatus = "Available";
            newSeverity = "None";
            newEtaVal = 0;
            // Add a new patient when an ambulance arrives
            const idVal = Math.floor(100 + Math.random() * 900);
            const severityOptions: ("Critical" | "Severe" | "Moderate")[] = ["Critical", "Severe", "Moderate"];
            const selectedSeverity = amb.patientSeverity !== "None" ? amb.patientSeverity : severityOptions[Math.floor(Math.random() * 3)];
            
            setPatients((prevPatients) => [
              {
                id: `P-${idVal}`,
                name: `Patient ${idVal} (Ambulance)`,
                age: Math.floor(18 + Math.random() * 70),
                gender: Math.random() > 0.5 ? "Male" : "Female",
                department: "Emergency",
                severity: selectedSeverity as any,
                waitTime: 0,
                status: "In Triage",
                admittedAt: new Date().toLocaleTimeString().substr(0, 5) + " " + new Date().toLocaleTimeString().substr(-2)
              },
              ...prevPatients
            ]);

            // Add notification
            setNotifications((prevN) => [
              { id: Math.random().toString(), text: `Ambulance ${amb.code} arrived with ${selectedSeverity} patient.`, severity: "info", time: "Just now", read: false },
              ...prevN
            ]);
            
            // Randomly respawn the ambulance later
            setTimeout(() => {
              setAmbulances((currentAmbs) =>
                currentAmbs.map((cAmb) =>
                  cAmb.id === amb.id
                    ? {
                        ...cAmb,
                        status: "En Route to Scene",
                        eta: Math.floor(10 + Math.random() * 10),
                        patientSeverity: "None",
                        coordinates: { x: Math.random() * 100, y: Math.random() * 100 }
                      }
                    : cAmb
                )
              );
            }, 10000);
          }

          const angle = Math.random() * Math.PI * 2;
          const xShift = Math.cos(angle) * 3;
          const yShift = Math.sin(angle) * 3;

          return {
            ...amb,
            status: newStatus,
            patientSeverity: newSeverity,
            eta: newEtaVal,
            coordinates: {
              x: Math.min(100, Math.max(0, amb.coordinates.x + xShift)),
              y: Math.min(100, Math.max(0, amb.coordinates.y + yShift))
            }
          };
        })
      );

      // 2. Fluctuates patient wait times (increase for waiting, decrease for admitted)
      setPatients((prev) =>
        prev.map((p) => {
          if (p.status === "Awaiting Doctor" || p.status === "In Triage") {
            let waitInc = 1;
            if (simulationState === "Trauma ER Surge" || simulationState === "Pandemic Load") {
              waitInc = 8;
            } else if (simulationState === "Staffing Shortage") {
              waitInc = 5;
            }
            return { ...p, waitTime: p.waitTime + waitInc };
          }
          return p;
        })
      );

      // 3. Modulate resource loads based on simulation state
      setResources((prev) =>
        prev.map((r) => {
          if (r.category === "Consumables") {
            // Deplete over time
            let depletion = r.id === "RES-04" ? 1 : 2; // Epinephrine vs Oxygen
            if (simulationState === "Resource Crisis") {
              depletion *= 3;
            } else if (simulationState === "Pandemic Load") {
              depletion *= 2;
            }
            const newVal = Math.max(0, r.allocated - depletion);
            return { ...r, allocated: newVal, history: [...r.history.slice(1), newVal] };
          } else if (r.category === "Equipment" || r.category === "Beds" || r.category === "Staff") {
            if (simulationState === "ICU Saturation" && r.id === "RES-01") {
              const newVal = Math.min(r.total, r.allocated + 2);
              return { ...r, allocated: newVal, history: [...r.history.slice(1), newVal] };
            }
            if (simulationState === "Staffing Shortage" && r.id === "RES-05") {
              const newVal = Math.max(5, r.allocated - 1);
              return { ...r, allocated: newVal, history: [...r.history.slice(1), newVal] };
            }
            if (simulationState === "Pandemic Load") {
              if (r.id === "RES-01") {
                const newVal = Math.min(r.total, r.allocated + 2);
                return { ...r, allocated: newVal, history: [...r.history.slice(1), newVal] };
              }
              if (r.id === "RES-05") {
                const newVal = Math.max(5, r.allocated - 1);
                return { ...r, allocated: newVal, history: [...r.history.slice(1), newVal] };
              }
            }
            // Small fluctuations
            const change = Math.random() > 0.5 ? 1 : -1;
            const newVal = Math.min(r.total, Math.max(0, r.allocated + change));
            return { ...r, allocated: newVal, history: [...r.history.slice(1), newVal] };
          }
          return r;
        })
      );

      // 4. Trigger critical anomaly spikes (higher chance in non-normal states)
      const anomalyChance = simulationState === "Normal Operations" ? 0.05 : 0.15;
      if (Math.random() < anomalyChance) {
        const types: ("Patient Surge" | "Staffing Deficit" | "Unusual Wait Spike" | "Consumables Depletion")[] = ["Patient Surge", "Staffing Deficit", "Unusual Wait Spike", "Consumables Depletion"];
        const chosenType = types[Math.floor(Math.random() * types.length)];
        
        if (chosenType === "Unusual Wait Spike") {
          const id = `ANM-${Math.floor(200 + Math.random() * 800)}`;
          setAnomalies((prev) => [
            {
              id,
              type: "Unusual Wait Spike",
              severity: "High",
              message: "Triage backlog: ER wait time peaked above 60 minutes.",
              timestamp: new Date().toLocaleTimeString().substr(0, 5) + " " + new Date().toLocaleTimeString().substr(-2),
              status: "Active",
              impactScore: 75
            },
            ...prev
          ]);
          setNotifications((prev) => [
            { id: Math.random().toString(), text: "WARNING: Emergency wait times spiking.", severity: "high", time: "Just now", read: false },
            ...prev
          ]);
        }
      }

    }, 8000);

    return () => clearInterval(timer);
  }, [patients, resources, anomalies, simulationState]);

  return (
    <SimulationContext.Provider
      value={{
        role,
        setRole,
        kpis: getKPIs(),
        patients,
        anomalies,
        recommendations,
        resources,
        auditLogs,
        ambulances,
        chatHistory,
        notifications,
        isBackendConnected,
        simulationState,
        setSimulationState,
        availableSimulationStates,
        addAuditLog,
        approveRecommendation,
        dismissRecommendation,
        resolveAnomaly,
        triggerManualSpike,
        sendChatMessage,
        clearNotifications,
        markNotificationRead
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};
