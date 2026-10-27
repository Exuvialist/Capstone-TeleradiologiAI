from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.enums import VerificationDecision, PredictionResult

class VerificationCreate(BaseModel):
    decision: VerificationDecision
    final_result: PredictionResult
    notes: str

class VerificationOut(BaseModel):
    id: int
    examination_id: int
    radiologist_id: int
    decision: VerificationDecision
    final_result: PredictionResult
    notes: str
    verified_at: datetime
    radiologist_name: Optional[str] = None

    class Config:
        from_attributes = True
