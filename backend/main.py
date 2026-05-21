import asyncio
import json
import random
import datetime
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from pydantic import BaseModel

from database import engine, get_db, SessionLocal
import models
import schemas
from forecasting import ClinicalPipelineForecaster
from anomaly_detector import AnomalyDetector

app = FastAPI(title="MediOps AI Decisions Intelligence Server")

# Allow CORS for Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For demo ease, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active WebSockets Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                # Remove stale connections
                pass

manager = ConnectionManager()

# Global Simulation State Machine
SIMULATION_STATES = ["Normal Operations", "Trauma ER Surge", "ICU Saturation", "Pandemic Load", "Staffing Shortage", "Resource Crisis"]
active_simulation_state = "Normal Operations"

class SimulationStateRequest(BaseModel):
    state: str

# Helper to log actions in the compliance log
def log_audit(db: Session, role: str, action: str, details: str):
    log_entry = models.AuditLog(
        user_role=role,
        action=action,
        details=details,
        timestamp=datetime.datetime.now()
    )
    db.add(log_entry)
    db.commit()

def sync_state_anomalies(db: Session, state: str):
    now = datetime.datetime.now()
    
    # 1. Resolve all active state-injected anomalies first so we don't duplicate them
    state_anomalies = db.query(models.Anomaly).filter(models.Anomaly.status == "Active").all()
    for anom in state_anomalies:
        if anom.id.startswith("ANM-STATE-"):
            anom.status = "Resolved"
            
    state_recs = db.query(models.Recommendation).filter(models.Recommendation.status == "Pending").all()
    for rec in state_recs:
        if rec.id.startswith("REC-STATE-"):
            rec.status = "Dismissed"
            
    db.commit()
    
    if state == "Normal Operations":
        # Also resolve standard anomalies to make a clean slate
        active_anom = db.query(models.Anomaly).filter(models.Anomaly.status == "Active").all()
        for anom in active_anom:
            anom.status = "Resolved"
        active_recs = db.query(models.Recommendation).filter(models.Recommendation.status == "Pending").all()
        for rec in active_recs:
            rec.status = "Dismissed"
        db.commit()
        return

    elif state == "Trauma ER Surge":
        anomaly = models.Anomaly(
            id="ANM-STATE-SURGE",
            type="Patient Surge",
            severity="Critical",
            message="Severe Multi-Vehicle Trauma inflow: ER admissions spiked by +40% in last 10 mins.",
            timestamp=now,
            status="Active",
            impact_score=95
        )
        rec = models.Recommendation(
            id="REC-STATE-SURGE",
            title="Activate ER Mass Casualty Protocol",
            description="Redirect non-trauma inbound ambulances to Mercy General and open ER Surge Unit B.",
            priority="Critical",
            confidence=97.0,
            factors="2 multi-trauma code reds active, ER waiting lobby capacity exceeded",
            operational_impact="Distributes acute trauma load, lowers congestion threat, reduces secondary wait indicators by 30%.",
            action_label="Activate Surge Plan",
            status="Pending"
        )
        db.add(anomaly)
        db.add(rec)
        
    elif state == "ICU Saturation":
        anomaly = models.Anomaly(
            id="ANM-STATE-ICU",
            type="ICU Overload",
            severity="Critical",
            message="ICU Unit at 100% capacity. Zero available emergency reserve beds.",
            timestamp=now,
            status="Active",
            impact_score=99
        )
        rec = models.Recommendation(
            id="REC-STATE-ICU",
            title="Initiate ICU Bed Cleanup Protocols",
            description="Expedite step-down discharge reviews and optimize bed turnaround procedures.",
            priority="Critical",
            confidence=95.0,
            factors="ICU at 100% occupancy, 3 trauma patients awaiting transfer from ED",
            operational_impact="Frees up bed capacity, resolves intensive care transfer delays, lowers ICU occupancy back to 85%.",
            action_label="Initiate Bed Cleanup",
            status="Pending"
        )
        db.add(anomaly)
        db.add(rec)
        
    elif state == "Pandemic Load":
        anomaly1 = models.Anomaly(
            id="ANM-STATE-PAND1",
            type="Patient Surge",
            severity="Critical",
            message="Systemic Pandemic Load: Outpatient and Emergency triage experiencing 3x standard intake volumes.",
            timestamp=now,
            status="Active",
            impact_score=95
        )
        anomaly2 = models.Anomaly(
            id="ANM-STATE-PAND2",
            type="Staffing Deficit",
            severity="High",
            message="Extreme staff strain: Patient-to-nurse ratio exceeds regulatory limits.",
            timestamp=now,
            status="Active",
            impact_score=88
        )
        rec1 = models.Recommendation(
            id="REC-STATE-PAND1",
            title="Activate Pandemic Surge Units",
            description="Convert physical ambulatory wards to emergency isolation zones and deploy auxiliary staff.",
            priority="Critical",
            confidence=94.0,
            factors="Sustained pandemic intake curve, active isolation protocols",
            operational_impact="Adds 20 isolation beds, reduces cross-contamination risk, manages patient volumes.",
            action_label="Activate Isolation Wards",
            status="Pending"
        )
        db.add(anomaly1)
        db.add(anomaly2)
        db.add(rec1)
        
    elif state == "Staffing Shortage":
        anomaly = models.Anomaly(
            id="ANM-STATE-STAFF",
            type="Staffing Deficit",
            severity="High",
            message="Under-staffing ratio detected in multiple wards due to high nurse call-out rates.",
            timestamp=now,
            status="Active",
            impact_score=85
        )
        rec = models.Recommendation(
            id="REC-STATE-STAFF",
            title="Deploy Additional Staff to ED",
            description="Reallocate nursing staff from lower-acuity departments to cover triage.",
            priority="High",
            confidence=92.0,
            factors="Triage delay exceeded 45 mins, staffing ratio deficit",
            operational_impact="Reduces triage waiting periods by 40%, reallocates core nurse resources to acute zones.",
            action_label="Redeploy Staff",
            status="Pending"
        )
        db.add(anomaly)
        db.add(rec)
        
    elif state == "Resource Crisis":
        anomaly = models.Anomaly(
            id="ANM-STATE-RES",
            type="Consumables Depletion",
            severity="High",
            message="Pharmacy Epinephrine vials below 20% critical threshold.",
            timestamp=now,
            status="Active",
            impact_score=82
        )
        rec = models.Recommendation(
            id="REC-STATE-RES",
            title="Restock Epinephrine Stocks in Pharmacy",
            description="Submit emergency purchase order for core pharmacy consumables.",
            priority="High",
            confidence=98.0,
            factors="Low consumables alert, epinephrine depletion rate 3x normal",
            operational_impact="Restores core pharmacy stock level to 100%, ensures medicine availability for cardiac events.",
            action_label="Authorize Pharmacy Reorder",
            status="Pending"
        )
        db.add(anomaly)
        db.add(rec)
        
    db.commit()


# --- API ENDPOINTS ---

@app.get("/api/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.datetime.now().isoformat()}

@app.get("/api/simulation/state")
def get_simulation_state():
    return {"state": active_simulation_state, "available_states": SIMULATION_STATES}

@app.post("/api/simulation/state")
def set_simulation_state(payload: SimulationStateRequest, db: Session = Depends(get_db)):
    global active_simulation_state
    state = payload.state
    if state not in SIMULATION_STATES:
        raise HTTPException(status_code=400, detail=f"Invalid simulation state. Must be one of {SIMULATION_STATES}")
    active_simulation_state = state
    
    # Inject anomalies / recommendations based on state
    sync_state_anomalies(db, state)
    
    log_audit(db, "Operations Manager", "Simulation State Changed", f"Simulation state changed to {state}.")
    return {"state": active_simulation_state, "available_states": SIMULATION_STATES}

@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    total_patients = db.query(models.Patient).filter(models.Patient.status != "Discharged").count()
    
    icu_res = db.query(models.Resource).filter(models.Resource.id == "RES-01").first()
    icu_occupancy = int((icu_res.allocated / icu_res.total) * 100) if icu_res and icu_res.total > 0 else 0
    
    er_patients = db.query(models.Patient).filter(
        models.Patient.department == "Emergency",
        models.Patient.status.in_(["In Triage", "Awaiting Doctor"])
    ).all()
    er_wait_time = int(sum(p.waitTime for p in er_patients) / len(er_patients)) if er_patients else 42
    
    staff_res = db.query(models.Resource).filter(models.Resource.id == "RES-05").first()
    staff_utilization = int((staff_res.allocated / staff_res.total) * 100) if staff_res and staff_res.total > 0 else 0
    
    active_anomalies = db.query(models.Anomaly).filter(models.Anomaly.status == "Active").count()
    pending_recommendations = db.query(models.Recommendation).filter(models.Recommendation.status == "Pending").count()
    
    beds_res = db.query(models.Resource).filter(models.Resource.category == "Beds").all()
    bed_availability = sum(r.total - r.allocated for r in beds_res)
    
    epi_res = db.query(models.Resource).filter(models.Resource.id == "RES-04").first()
    epinephrine_stock = int((epi_res.allocated / epi_res.total) * 100) if epi_res and epi_res.total > 0 else 0
    
    return {
        "total_patients": total_patients,
        "icu_occupancy": icu_occupancy,
        "er_wait_time": er_wait_time,
        "staff_utilization": staff_utilization,
        "active_anomalies": active_anomalies,
        "pending_recommendations": pending_recommendations,
        "bed_availability": bed_availability,
        "epinephrine_stock": epinephrine_stock
    }

@app.get("/api/patients", response_model=List[schemas.PatientResponse])
def get_patients(db: Session = Depends(get_db)):
    return db.query(models.Patient).all()

@app.get("/api/admissions/history")
def get_historical_admissions(db: Session = Depends(get_db)):
    """Fetch all historical daily admissions for charting."""
    admissions = db.query(models.Admission).order_by(models.Admission.date.asc()).all()
    # Group by date for easy chart visualization
    grouped = {}
    for adm in admissions:
        if adm.date not in grouped:
            grouped[adm.date] = {"date": adm.date}
        grouped[adm.date][adm.department] = adm.count
        
    return list(grouped.values())

@app.get("/api/resources", response_model=List[schemas.ResourceResponse])
def get_resources(db: Session = Depends(get_db)):
    """Get active resource levels."""
    return db.query(models.Resource).all()

@app.get("/api/anomalies", response_model=List[schemas.AnomalyResponse])
def get_anomalies(db: Session = Depends(get_db)):
    """Get all system operational anomalies."""
    return db.query(models.Anomaly).order_by(models.Anomaly.status.asc(), models.Anomaly.timestamp.desc()).all()

@app.post("/api/anomalies/{id}/resolve")
def resolve_anomaly(id: str, db: Session = Depends(get_db)):
    """Mark an anomaly as resolved and log the action."""
    anomaly = db.query(models.Anomaly).filter(models.Anomaly.id == id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")
    
    anomaly.status = "Resolved"
    db.commit()
    
    log_audit(db, "Operations Manager", "Anomaly Resolved", f"Flagged anomaly {id} ({anomaly.type}) as resolved.")
    return {"status": "success", "anomaly_id": id}

@app.get("/api/recommendations", response_model=List[schemas.RecommendationResponse])
def get_recommendations(db: Session = Depends(get_db)):
    """Get all AI recommended actions."""
    return db.query(models.Recommendation).filter(models.Recommendation.status == "Pending").all()

@app.post("/api/recommendations/{id}/approve")
def approve_recommendation(id: str, role: str = "Executive Director", db: Session = Depends(get_db)):
    """Approve and execute a recommendation. Simulates impact on live resources."""
    rec = db.query(models.Recommendation).filter(models.Recommendation.id == id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
        
    rec.status = "Approved"
    
    # Simulate database updates depending on recommendation action
    log_details = f"Approved and executed: '{rec.title}'."
    
    if id in ["REC-401", "REC-STATE-STAFF"]:
        # ED staff upgrade
        er_staff = db.query(models.Resource).filter(models.Resource.id == "RES-05").first()
        ward_beds = db.query(models.Resource).filter(models.Resource.id == "RES-06").first()
        if er_staff:
            er_staff.allocated = min(er_staff.total, er_staff.allocated + 3)
        if ward_beds:
            ward_beds.allocated = max(0, ward_beds.allocated - 4)
            
        # Resolve ER wait spike anomalies
        wait_anomalies = db.query(models.Anomaly).filter(
            models.Anomaly.type == "Unusual Wait Spike",
            models.Anomaly.status == "Active"
        ).all()
        for wa in wait_anomalies:
            wa.status = "Resolved"
        log_details += " ER Staff count increased; resolved active ED wait spike anomalies."
            
    elif id in ["REC-402", "REC-STATE-ICU"]:
        icu_beds = db.query(models.Resource).filter(models.Resource.id == "RES-01").first()
        if icu_beds:
            icu_beds.allocated = max(0, icu_beds.allocated - 3)
            
        icu_anomalies = db.query(models.Anomaly).filter(
            models.Anomaly.type == "ICU Overload",
            models.Anomaly.status == "Active"
        ).all()
        for ia in icu_anomalies:
            ia.status = "Resolved"
        log_details += " 3 ICU beds cleared; resolved ICU capacity overload flags."
            
    elif id in ["REC-403", "REC-STATE-RES"]:
        epi_stock = db.query(models.Resource).filter(models.Resource.id == "RES-04").first()
        if epi_stock:
            epi_stock.allocated = epi_stock.total
        log_details += " Epinephrine vials refilled to maximum capacity."

    db.commit()
    log_audit(db, role, "Approved Recommendation", log_details)
    return {"status": "success", "recommendation_id": id, "effect": log_details}

@app.post("/api/recommendations/{id}/dismiss")
def dismiss_recommendation(id: str, role: str = "Executive Director", db: Session = Depends(get_db)):
    """Dismiss a recommendation."""
    rec = db.query(models.Recommendation).filter(models.Recommendation.id == id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
        
    rec.status = "Dismissed"
    db.commit()
    
    log_audit(db, role, "Dismissed Recommendation", f"Dismissed: '{rec.title}'.")
    return {"status": "success", "recommendation_id": id}

@app.get("/api/audit-logs", response_model=List[schemas.AuditLogResponse])
def get_audit_logs(db: Session = Depends(get_db)):
    """Fetch complete compliance audit trail."""
    return db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).all()

@app.post("/api/audit-logs")
def create_audit_log(payload: schemas.AuditLogBase, db: Session = Depends(get_db)):
    """Create a manual audit log entry."""
    log_audit(db, payload.user_role, payload.action, payload.details)
    return {"status": "success"}

@app.get("/api/forecast")
def get_forecast(metric: str = "admissions", steps: int = 7, db: Session = Depends(get_db)):
    if metric == "admissions" or metric == "icu":
        dept = "Emergency" if metric == "admissions" else "ICU"
        history = db.query(models.Admission).filter(models.Admission.department == dept).order_by(models.Admission.date.asc()).all()
        if not history:
            history_data = [{"date": "2026-05-20", "count": 45}]
        else:
            history_data = [{"date": h.date, "count": h.count} for h in history]
            
        forecaster = ClinicalPipelineForecaster()
        forecaster.fit(history_data)
        prediction = forecaster.predict(steps)
        
        last_date_str = history_data[-1]["date"]
        last_date = datetime.datetime.strptime(last_date_str, "%Y-%m-%d").date()
        
        forecast_list = []
        for i in range(steps):
            next_date = last_date + datetime.timedelta(days=i+1)
            forecast_list.append({
                "date": next_date.strftime("%Y-%m-%d"),
                "predicted": round(prediction["forecast"][i], 1),
                "lower": round(prediction["confidence_lower"][i], 1),
                "upper": round(prediction["confidence_upper"][i], 1)
            })
            
        return {
            "metric": metric,
            "history": history_data[-14:],
            "forecast": forecast_list
        }
    elif metric == "epinephrine":
        # Generate a depletion forecast based on current stock and burn rate
        epi = db.query(models.Resource).filter(models.Resource.id == "RES-04").first()
        current_val = epi.allocated if epi else 150
        total_val = epi.total if epi else 1000
        
        # history of past stock levels (simulated)
        history_data = []
        today = datetime.date.today()
        for i in range(14, 0, -1):
            past_date = today - datetime.timedelta(days=i)
            # simulate a steady decline in the past
            past_stock = min(total_val, current_val + i * 5 + random.randint(-5, 5))
            history_data.append({"date": past_date.strftime("%Y-%m-%d"), "count": past_stock})
            
        # Burn rate based on state
        burn_rate = 5
        if active_simulation_state == "Pandemic Load":
            burn_rate = 15
        elif active_simulation_state == "Resource Crisis":
            burn_rate = 20
            
        forecast_list = []
        for i in range(steps):
            next_date = today + datetime.timedelta(days=i+1)
            predicted = max(0, current_val - burn_rate * (i + 1))
            forecast_list.append({
                "date": next_date.strftime("%Y-%m-%d"),
                "predicted": float(predicted),
                "lower": float(max(0, predicted - 10)),
                "upper": float(min(total_val, predicted + 10))
            })
            
        return {
            "metric": metric,
            "history": history_data,
            "forecast": forecast_list
        }
    else:
        raise HTTPException(status_code=400, detail="Invalid forecasting metric")

@app.get("/api/forecasting/predict")
def predict_admissions(department: str = "Emergency", steps: int = 7, db: Session = Depends(get_db)):
    # Alias to keep compatibility
    metric = "admissions" if department == "Emergency" else "icu"
    return get_forecast(metric=metric, steps=steps, db=db)

@app.post("/api/simulation/spike")
def trigger_spike(payload: dict, db: Session = Depends(get_db)):
    """Inject a manual operational event spike into the database (ER_SURGE, ICU_OVERLOAD, STAFF_SHORTAGE)."""
    global active_simulation_state
    event_type = payload.get("type")
    now = datetime.datetime.now()
    
    if event_type == "ER_SURGE":
        active_simulation_state = "Trauma ER Surge"
        # Add Emergency spike anomaly
        anomaly = models.Anomaly(
            id=f"ANM-SURG-{random.randint(100,999)}",
            type="Patient Surge",
            severity="Critical",
            message="Severe Multi-Vehicle Trauma inflow: ER admissions spiked by +40% in last 10 mins.",
            timestamp=now,
            status="Active",
            impact_score=95
        )
        # Add emergency recommendation
        rec = models.Recommendation(
            id=f"REC-SURG-{random.randint(100,999)}",
            title="Activate ER Mass Casualty Protocol",
            description="Redirect non-trauma inbound ambulances to Mercy General and open ER Surge Unit B.",
            priority="Critical",
            confidence=97.0,
            factors="2 multi-trauma code reds active,ER waiting lobby capacity exceeded,FastAPI prediction expects 12 additional arrivals",
            operational_impact="Distributes acute trauma load, lowers congestion threat, reduces secondary wait indicators by 30%.",
            action_label="Activate Surge Plan",
            status="Pending"
        )
        # Boost ER staff allocated slightly to show congestion response
        er_staff = db.query(models.Resource).filter(models.Resource.id == "RES-05").first()
        if er_staff:
            er_staff.allocated = er_staff.total
            
        db.add(anomaly)
        db.add(rec)
        log_audit(db, "Operations Manager", "ER Surge Injected", "Manual simulator event: ER mass casualty incident surge injected.")
        
    elif event_type == "ICU_OVERLOAD":
        active_simulation_state = "ICU Saturation"
        # Set ICU Beds allocation to 100%
        icu = db.query(models.Resource).filter(models.Resource.id == "RES-01").first()
        if icu:
            icu.allocated = icu.total
            
        anomaly = models.Anomaly(
            id=f"ANM-ICU-{random.randint(100,999)}",
            type="ICU Overload",
            severity="Critical",
            message="ICU Unit at 100% capacity. Zero available emergency reserve beds.",
            timestamp=now,
            status="Active",
            impact_score=99
        )
        db.add(anomaly)
        log_audit(db, "Chief Medical Officer", "ICU Overload Injected", "Manual simulator event: ICU capacity spiked to 100%.")
        
    elif event_type == "STAFF_SHORTAGE":
        active_simulation_state = "Staffing Shortage"
        # Set ER staff allocated to low level
        er_staff = db.query(models.Resource).filter(models.Resource.id == "RES-05").first()
        if er_staff:
            er_staff.allocated = min(er_staff.total, 10)
            
        anomaly = models.Anomaly(
            id=f"ANM-STF-{random.randint(100,999)}",
            type="Staffing Deficit",
            severity="High",
            message="High staff call-outs in Pediatric unit. Under-staffing ratio detected.",
            timestamp=now,
            status="Active",
            impact_score=82
        )
        db.add(anomaly)
        log_audit(db, "Operations Manager", "Staff Shortage Injected", "Manual simulator event: Nurse shortage simulation injected.")
        
    else:
        raise HTTPException(status_code=400, detail="Invalid spike event type")
        
    db.commit()
    return {"status": "success", "event": event_type, "new_simulation_state": active_simulation_state}


@app.post("/api/chat", response_model=schemas.ChatResponse)
def assistant_chat(request: schemas.ChatRequest, db: Session = Depends(get_db)):
    text = request.text
    lower_text = text.lower()
    
    reply = ""
    table_data = None
    chart_data = None
    
    # Query database stats for actual data summaries
    resources = db.query(models.Resource).all()
    anomalies = db.query(models.Anomaly).filter(models.Anomaly.status == "Active").all()
    
    icu_bed = next((r for r in resources if r.id == "RES-01"), None)
    er_staff = next((r for r in resources if r.id == "RES-05"), None)
    epi = next((r for r in resources if r.id == "RES-04"), None)
    
    icu_occ = f"{icu_bed.allocated}/{icu_bed.total} beds occupied ({int((icu_bed.allocated/icu_bed.total)*100)}%)" if icu_bed else "N/A"
    
    # 0. Patients flow queries
    if any(k in lower_text for k in ["patients", "triage", "waiting", "waiting list", "patient roster"]):
        waiting_patients = db.query(models.Patient).filter(models.Patient.status.in_(["In Triage", "Awaiting Doctor"])).all()
        waiting_count = len(waiting_patients)
        
        reply = (
            f"### Active Triage Patients\n"
            f"There are currently **{waiting_count}** active patients waiting in triage or awaiting a physician review.\n"
            f"Below is the current prioritized wait roster. I recommend immediate nursing intervention for critical/severe cases."
        )
        table_data = [
            {
                "ID": p.id,
                "Name": p.name,
                "Age": p.age,
                "Severity": p.severity,
                "Wait Time": f"{p.waitTime}m",
                "Status": p.status
            }
            for p in waiting_patients
        ]
        
    # 0.1 Simulation queries
    elif any(k in lower_text for k in ["simulation", "state", "mode", "current state", "scenario"]):
        reply = (
            f"### Operational Simulation Engine Status\n"
            f"*   **Active Scenario Mode**: `{active_simulation_state}`\n"
            f"*   **System Status**: {'Degraded (Anomalies Active)' if len(anomalies) > 0 else 'Optimal / Nominal'}\n"
            f"You can switch between scenario states using the **Operations Simulation Engine** selector on the main dashboard to simulate various crisis flow constraints."
        )
        
    # 1. ER congestion/wait questions
    elif any(k in lower_text for k in ["er", "emergency", "congestion", "wait"]):
        er_patients = db.query(models.Patient).filter(
            models.Patient.department == "Emergency",
            models.Patient.status.in_(["In Triage", "Awaiting Doctor"])
        ).all()
        avg_wait = int(sum(p.waitTime for p in er_patients) / len(er_patients)) if er_patients else 42
        
        reply = (
            f"### Emergency Department Operational Status\n"
            f"*   **Active Clinical Staff**: {er_staff.allocated}/{er_staff.total} units deployed.\n"
            f"*   **Status**: {'Backlogged' if any(a.type == 'Unusual Wait Spike' for a in anomalies) else 'Optimal'}.\n"
            f"The current average ER wait time is estimated at **{avg_wait} minutes**.\n"
            f"I recommend reallocating staff from the General Wards immediately using pending recommendation to reduce triage waiting periods."
        )
        table_data = [
            {"Department": "Emergency", "Staff Allocated": f"{er_staff.allocated}/{er_staff.total}", "Avg Wait Time": f"{avg_wait}m", "Status": "Warning" if any(a.type == 'Unusual Wait Spike' for a in anomalies) else "Normal"}
        ]
        
    # 2. Forecasts questions
    elif any(k in lower_text for k in ["forecast", "friday", "occupancy", "predict"]):
        reply = (
            f"### Admissions Trend Forecast\n"
            f"Running our **Clinical LSTM / Prophet Pipeline** on historical records, we anticipate a **15% to 20% spike** in ICU & Emergency admissions starting Friday evening.\n"
            f"*   **Peak Expected Admissions**: 178 patients.\n"
            f"*   **Confidence Rating**: 94%.\n"
            f"We advise checking emergency reserves and delaying non-urgent elective admissions to preserve ICU beds."
        )
        chart_data = [
            {"day": "Wed (Hist)", "admissions": 145},
            {"day": "Thu (Hist)", "admissions": 154},
            {"day": "Fri (Forecast)", "admissions": 178},
            {"day": "Sat (Forecast)", "admissions": 165},
            {"day": "Sun (Forecast)", "admissions": 148}
        ]
        
    # 3. Epinephrine or stock levels
    elif any(k in lower_text for k in ["epinephrine", "stock", "pharmacy", "supply"]):
        epi_percent = int((epi.allocated / epi.total) * 100) if epi else 0
        reply = (
            f"### Pharmacy Stock Level Alert\n"
            f"*   **Resource**: Epinephrine Vials\n"
            f"*   **Stock Level**: {epi_percent}% ({epi.allocated}/{epi.total} vials remaining)\n"
            f"*   **Alert status**: {'Critical Low' if epi_percent < 20 else 'Satisfactory'}.\n"
            f"An automated purchase order recommendation has been drafted to restock Epinephrine vials. Please approve it in the Decision Intelligence Center."
        )
        
    # 4. Executive summary
    elif any(k in lower_text for k in ["summary", "executive", "report", "overview"]):
        total_patients = db.query(models.Patient).filter(models.Patient.status != "Discharged").count()
        active_anom_count = len(anomalies)
        
        er_patients = db.query(models.Patient).filter(
            models.Patient.department == "Emergency",
            models.Patient.status.in_(["In Triage", "Awaiting Doctor"])
        ).all()
        avg_wait = int(sum(p.waitTime for p in er_patients) / len(er_patients)) if er_patients else 42
        
        reply = (
            f"### Executive Hospital Operations Summary\n"
            f"*   **Active Hospital Roster**: {total_patients} patients currently in-system.\n"
            f"*   **ICU Occupancy**: {icu_occ}\n"
            f"*   **Average ER Triage Wait Time**: {avg_wait} minutes.\n"
            f"*   **Active Operational Alerts**: {active_anom_count} anomalies active.\n"
            f"*   **Core Operational Recommendations**:\n"
            f"    1. Approve ED staff redeployment to alleviate ER congestion.\n"
            f"    2. Initiate ICU rapid step-down discharge reviews to free up beds.\n"
            f"    3. Authorize Epinephrine pharmacy reorder to prevent supplier lead-time stockouts."
        )
        table_data = [
            {"Metric": "ICU Occupancy", "Value": icu_occ, "Status": "Critical" if icu_bed and (icu_bed.allocated/icu_bed.total) >= 0.9 else "Normal"},
            {"Metric": "Active Anomalies", "Value": str(active_anom_count), "Status": "Alert" if active_anom_count > 0 else "Clear"},
            {"Metric": "Epinephrine Stock", "Value": f"{epi.allocated}/{epi.total} Vials" if epi else "N/A", "Status": "Low" if epi and (epi.allocated/epi.total) < 0.2 else "OK"}
        ]
        
    # 5. Default Fallback
    else:
        reply = (
            "I have compiled the live hospital stats from the database. Currently, we are monitoring:\n"
            f"*   **ICU Bed Load**: {icu_occ}\n"
            f"*   **Active Alerts**: {len(anomalies)} anomalies requiring clinician review.\n"
            "You can ask me to: `Summarize today's ER congestion`, `Show active triage patients`, `Check simulation state`, or `What is the forecasted bed occupancy?`."
        )
        
    return schemas.ChatResponse(sender="ai", text=reply, tableData=table_data, chartData=chart_data)


# --- WEBSOCKET REAL-TIME TELEMETRY STREAM ---

async def telemetry_stream_loop():
    """
    Background simulation logic mimicking hospital IoT signals.
    Slightly fluctuates resource loads, ambulance ETAs, and broadcasts to active WebSockets.
    """
    # Create internal db session to avoid dependency clashes
    db = SessionLocal()
    
    # Seed local ambulance trackings
    ambulances = [
        {"id": "AMB-01", "code": "MED-ALPHA", "status": "Returning to Hospital", "eta": 4, "patientSeverity": "Severe", "x": 35.0, "y": 42.0},
        {"id": "AMB-02", "code": "MED-BETA", "status": "En Route to Scene", "eta": 9, "patientSeverity": "None", "x": 15.0, "y": 72.0},
        {"id": "AMB-03", "code": "MED-GAMMA", "status": "Dispatched", "eta": 14, "patientSeverity": "Critical", "x": 62.0, "y": 22.0},
        {"id": "AMB-04", "code": "MED-DELTA", "status": "Available", "eta": 0, "patientSeverity": "None", "x": 50.0, "y": 50.0}
    ]
    
    try:
        while True:
            await asyncio.sleep(3.0)  # Telemetry update tick every 3 seconds
            
            # Fetch active stats from database
            resources = db.query(models.Resource).all()
            anomalies = db.query(models.Anomaly).filter(models.Anomaly.status == "Active").all()
            
            # 1. Fluctuate resources based on active_simulation_state
            for r in resources:
                if active_simulation_state == "Normal Operations":
                    if r.category == "Consumables":
                        depletion = 1 if r.id == "RES-04" else 2
                        r.allocated = max(0, r.allocated - depletion)
                    elif r.category in ["Equipment", "Beds"]:
                        change = random.choice([-1, 0, 1])
                        r.allocated = min(r.total, max(0, r.allocated + change))
                
                elif active_simulation_state == "Trauma ER Surge":
                    if r.id == "RES-05":  # ED Staff
                        r.allocated = min(r.total, r.allocated + 1)
                    elif r.id == "RES-01":  # ICU Beds
                        change = random.choice([0, 1])
                        r.allocated = min(r.total, r.allocated + change)
                    elif r.category == "Consumables":
                        r.allocated = max(0, r.allocated - 2)
                    elif r.category in ["Equipment", "Beds"]:
                        change = random.choice([-1, 0, 1])
                        r.allocated = min(r.total, max(0, r.allocated + change))
                
                elif active_simulation_state == "ICU Saturation":
                    if r.id == "RES-01":  # ICU Beds
                        r.allocated = min(r.total, r.allocated + 2)
                    elif r.category == "Consumables":
                        r.allocated = max(0, r.allocated - 1)
                    elif r.category in ["Equipment", "Beds"]:
                        change = random.choice([-1, 0, 1])
                        r.allocated = min(r.total, max(0, r.allocated + change))
                
                elif active_simulation_state == "Pandemic Load":
                    if r.category == "Consumables":
                        r.allocated = max(0, r.allocated - 3)
                    elif r.category in ["Beds", "Equipment"]:
                        r.allocated = min(r.total, r.allocated + 2)
                    elif r.id == "RES-05":  # Staff
                        r.allocated = max(5, r.allocated - 1)
                
                elif active_simulation_state == "Staffing Shortage":
                    if r.category == "Staff" or r.id == "RES-05":
                        r.allocated = max(5, r.allocated - 1)
                    elif r.category == "Consumables":
                        r.allocated = max(0, r.allocated - 1)
                    elif r.category in ["Equipment", "Beds"]:
                        change = random.choice([-1, 0, 1])
                        r.allocated = min(r.total, max(0, r.allocated + change))
                
                elif active_simulation_state == "Resource Crisis":
                    if r.category == "Consumables":
                        r.allocated = max(0, r.allocated - 4)  # 3-4x depletion rate
                    elif r.category in ["Equipment", "Beds"]:
                        change = random.choice([-1, 0, 1])
                        r.allocated = min(r.total, max(0, r.allocated + change))
            
            # Fluctuate wait times in database for active triage/waiting patients
            patients_waiting = db.query(models.Patient).filter(models.Patient.status.in_(["In Triage", "Awaiting Doctor"])).all()
            for p in patients_waiting:
                if active_simulation_state == "Normal Operations":
                    p.waitTime += random.choice([1, 2, 3])
                elif active_simulation_state in ["Trauma ER Surge", "Pandemic Load"]:
                    p.waitTime += random.choice([5, 8, 12])
                elif active_simulation_state == "Staffing Shortage":
                    p.waitTime += random.choice([4, 6, 8])
                else:
                    p.waitTime += random.choice([2, 4, 5])
            
            db.commit()
            
            # 2. Run automated anomaly scans
            wait_times_simulate = [42, 45, 48, 52, 65] if any(a.type == "Unusual Wait Spike" for a in anomalies) else [32, 35, 38, 40, 42]
            resource_dicts = [{"name": r.name, "category": r.category, "allocated": r.allocated, "total": r.total} for r in resources]
            
            scanned_alerts = AnomalyDetector.scan_operations(resource_dicts, wait_times_simulate)
            
            # Write new anomalies found to database
            for alert in scanned_alerts:
                existing = db.query(models.Anomaly).filter(models.Anomaly.id == alert["id"]).first()
                if not existing:
                    new_anom = models.Anomaly(
                        id=alert["id"],
                        type=alert["type"],
                        severity=alert["severity"],
                        message=alert["message"],
                        impact_score=alert["impact_score"],
                        status="Active",
                        timestamp=datetime.datetime.now()
                    )
                    db.add(new_anom)
                    db.commit()
                    log_audit(db, "System Monitor", "Anomaly Flagged", f"Scanned anomaly trigger: {alert['message']}")

            # 3. Fluctuate active ambulance GPS coordinates and ETAs
            for amb in ambulances:
                if amb["status"] == "Available":
                    continue
                
                amb["eta"] = max(0, amb["eta"] - 1)
                
                if amb["eta"] == 0:
                    amb["status"] = "Available"
                    amb["patientSeverity"] = "None"
                    # Reset coordinates to hub
                    amb["x"] = 50.0
                    amb["y"] = 50.0
                    
                    # Log ambulance arrival
                    log_audit(db, "Emergency Coordinator", "Ambulance Arrived", f"Ambulance {amb['code']} arrived with emergency intake.")
                    
                    # Respawn after 12 seconds
                    async def respawn(amb_id=amb["id"]):
                        await asyncio.sleep(12.0)
                        for a in ambulances:
                            if a["id"] == amb_id:
                                a["status"] = "En Route to Scene"
                                a["eta"] = random.randint(8, 15)
                                a["patientSeverity"] = random.choice(["Critical", "Severe", "Moderate"])
                                a["x"] = random.uniform(10.0, 90.0)
                                a["y"] = random.uniform(10.0, 90.0)
                    asyncio.create_task(respawn())
                else:
                    # Move coordinates slightly closer to center (50, 50)
                    dx = 50.0 - amb["x"]
                    dy = 50.0 - amb["y"]
                    amb["x"] += dx * 0.15 + random.uniform(-2, 2)
                    amb["y"] += dy * 0.15 + random.uniform(-2, 2)
                    amb["x"] = min(100.0, max(0.0, amb["x"]))
                    amb["y"] = min(100.0, max(0.0, amb["y"]))

            # Serialize data packet to stream
            telemetry_data = {
                "timestamp": datetime.datetime.now().strftime("%I:%M:%S %p"),
                "simulationState": active_simulation_state,
                "resources": [
                    {"id": r.id, "name": r.name, "category": r.category, "total": r.total, "allocated": r.allocated, "unit": r.unit}
                    for r in resources
                ],
                "anomalies": [
                    {"id": a.id, "type": a.type, "severity": a.severity, "message": a.message, "status": a.status, "impactScore": a.impact_score, "timestamp": a.timestamp.strftime("%I:%M %p")}
                    for a in db.query(models.Anomaly).filter(models.Anomaly.status == "Active").all()
                ],
                "ambulances": ambulances,
                "patients": [
                    {"id": p.id, "name": p.name, "age": p.age, "gender": p.gender, "department": p.department, "severity": p.severity, "waitTime": p.waitTime, "status": p.status, "bedNumber": p.bedNumber, "admittedAt": p.admittedAt}
                    for p in db.query(models.Patient).all()
                ],
                "icuOccupancy": int((next((r.allocated for r in resources if r.id == "RES-01"), 38) / next((r.total for r in resources if r.id == "RES-01"), 40)) * 100),
                "erWaitTime": int(sum(p.waitTime for p in db.query(models.Patient).filter(models.Patient.department == "Emergency", models.Patient.status.in_(["In Triage", "Awaiting Doctor"])).all()) / max(1, db.query(models.Patient).filter(models.Patient.department == "Emergency", models.Patient.status.in_(["In Triage", "Awaiting Doctor"])).count())) or 42,
                "staffUtilization": int((next((r.allocated for r in resources if r.id == "RES-05"), 22) / next((r.total for r in resources if r.id == "RES-05"), 24)) * 100)
            }
            
            await manager.broadcast(json.dumps(telemetry_data))
            
    except Exception as e:
        print(f"Telemetry loop error: {e}")
    finally:
        db.close()


async def websocket_handler(websocket: WebSocket):
    await manager.connect(websocket)
    db = SessionLocal()
    try:
        resources = db.query(models.Resource).all()
        anomalies = db.query(models.Anomaly).filter(models.Anomaly.status == "Active").all()
        telemetry_data = {
            "timestamp": datetime.datetime.now().strftime("%I:%M:%S %p"),
            "simulationState": active_simulation_state,
            "resources": [
                {"id": r.id, "name": r.name, "category": r.category, "total": r.total, "allocated": r.allocated, "unit": r.unit}
                for r in resources
            ],
            "anomalies": [
                {"id": a.id, "type": a.type, "severity": a.severity, "message": a.message, "status": a.status, "impactScore": a.impact_score, "timestamp": a.timestamp.strftime("%I:%M %p")}
                for a in anomalies
            ],
            "ambulances": [],  # will be filled by next tick
            "patients": [
                {"id": p.id, "name": p.name, "age": p.age, "gender": p.gender, "department": p.department, "severity": p.severity, "waitTime": p.waitTime, "status": p.status, "bedNumber": p.bedNumber, "admittedAt": p.admittedAt}
                for p in db.query(models.Patient).all()
            ],
            "icuOccupancy": int((next((r.allocated for r in resources if r.id == "RES-01"), 38) / next((r.total for r in resources if r.id == "RES-01"), 40)) * 100),
            "erWaitTime": int(sum(p.waitTime for p in db.query(models.Patient).filter(models.Patient.department == "Emergency", models.Patient.status.in_(["In Triage", "Awaiting Doctor"])).all()) / max(1, db.query(models.Patient).filter(models.Patient.department == "Emergency", models.Patient.status.in_(["In Triage", "Awaiting Doctor"])).count())) or 42,
            "staffUtilization": int((next((r.allocated for r in resources if r.id == "RES-05"), 22) / next((r.total for r in resources if r.id == "RES-05"), 24)) * 100)
        }
        await websocket.send_text(json.dumps(telemetry_data))
    except Exception as e:
        print(f"Error in websocket initial send: {e}")
    finally:
        db.close()

    try:
        while True:
            # Keep socket alive and check for client-side termination or messaging
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.websocket("/ws/telemetry")
async def ws_telemetry(websocket: WebSocket):
    await websocket_handler(websocket)


@app.websocket("/ws/live")
async def ws_live(websocket: WebSocket):
    await websocket_handler(websocket)


# Start telemetry background task on app startup
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(telemetry_stream_loop())
