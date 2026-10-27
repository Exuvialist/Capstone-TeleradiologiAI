from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.enums import DiseaseType, ExaminationStatus, PredictionResult
from app.schemas.ai import AIPredictionOut
from app.schemas.verification import VerificationOut

class ExaminationAssignRequest(BaseModel):
    mode: str = "automatic"  # "automatic" | "manual"
    radiologist_id: Optional[int] = None

class ExaminationListItem(BaseModel):
    id: int
    disease_type: DiseaseType
    image_path: str
    status: ExaminationStatus
    uploaded_by: int
    uploader_name: Optional[str] = None
    assigned_radiologist_id: Optional[int] = None
    assigned_radiologist_name: Optional[str] = None
    predicted_result: Optional[PredictionResult] = None
    final_result: Optional[PredictionResult] = None
    created_at: datetime
    assigned_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ExaminationDetailOut(BaseModel):
    id: int
    uploaded_by: int
    uploader_name: Optional[str] = None
    assigned_radiologist_id: Optional[int] = None
    assigned_radiologist_name: Optional[str] = None
    disease_type: DiseaseType
    image_path: str
    status: ExaminationStatus
    created_at: datetime
    assigned_at: Optional[datetime] = None
    ai_prediction: Optional[AIPredictionOut] = None
    verification: Optional[VerificationOut] = None

    class Config:
        from_attributes = True
