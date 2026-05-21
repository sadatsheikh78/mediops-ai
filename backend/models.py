from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from sqlalchemy.sql import func
try:
    from .database import Base
except ImportError:
    from database import Base

class Admission(Base):
    __tablename__ = "admissions"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, index=True)
    department = Column(String, index=True)
    count = Column(Integer)

class Resource(Base):
    __tablename__ = "resources"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    category = Column(String)  # Beds, Equipment, Consumables, Staff
    total = Column(Integer)
    allocated = Column(Integer)
    unit = Column(String)

class Anomaly(Base):
    __tablename__ = "anomalies"
    id = Column(String, primary_key=True, index=True)
    type = Column(String)  # Billing Pattern, Patient Surge, Staffing Deficit, ICU Overload, Unusual Wait Spike
    severity = Column(String)  # Critical, High, Medium
    message = Column(Text)
    timestamp = Column(DateTime, default=func.now())
    status = Column(String, default="Active")  # Active, Resolved
    impact_score = Column(Integer)

class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    priority = Column(String)  # Critical, High, Medium
    confidence = Column(Float)  # Percentage, e.g., 94.5
    factors = Column(Text)  # JSON or comma-separated list of drivers
    operational_impact = Column(Text)
    action_label = Column(String)
    status = Column(String, default="Pending")  # Pending, Approved, Dismissed

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=func.now())
    user_role = Column(String)
    action = Column(String)
    details = Column(Text)

class Patient(Base):
    __tablename__ = "patients"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    age = Column(Integer)
    gender = Column(String)
    department = Column(String)
    severity = Column(String)  # Critical, Severe, Moderate, Mild
    waitTime = Column(Integer)  # minutes
    status = Column(String)  # Admitted, In Triage, Awaiting Doctor, Discharged
    bedNumber = Column(String, nullable=True)
    admittedAt = Column(String)

