from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class AdmissionBase(BaseModel):
    date: str
    department: str
    count: int

class AdmissionResponse(AdmissionBase):
    id: int
    class Config:
        from_attributes = True

class ResourceBase(BaseModel):
    id: str
    name: str
    category: str
    total: int
    allocated: int
    unit: str

class ResourceResponse(ResourceBase):
    class Config:
        from_attributes = True

class AnomalyBase(BaseModel):
    id: str
    type: str
    severity: str
    message: str
    status: str
    impact_score: int

class AnomalyResponse(AnomalyBase):
    timestamp: datetime
    class Config:
        from_attributes = True

class RecommendationBase(BaseModel):
    id: str
    title: str
    description: str
    priority: str
    confidence: float
    factors: str
    operational_impact: str
    action_label: str
    status: str

class RecommendationResponse(RecommendationBase):
    class Config:
        from_attributes = True

class AuditLogBase(BaseModel):
    user_role: str
    action: str
    details: str

class AuditLogResponse(AuditLogBase):
    id: int
    timestamp: datetime
    class Config:
        from_attributes = True

class PatientBase(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    department: str
    severity: str
    waitTime: int
    status: str
    bedNumber: Optional[str] = None
    admittedAt: str

class PatientResponse(PatientBase):
    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    text: str

class ChatResponse(BaseModel):
    sender: str
    text: str
    tableData: Optional[List[dict]] = None
    chartData: Optional[List[dict]] = None

