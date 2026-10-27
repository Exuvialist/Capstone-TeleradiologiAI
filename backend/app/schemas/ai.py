from datetime import datetime
from pydantic import BaseModel
from app.models.enums import PredictionResult

class AIPredictionOut(BaseModel):
    id: int
    examination_id: int
    model_version: str
    predicted_result: PredictionResult
    probability: float
    inference_ms: int
    created_at: datetime

    class Config:
        from_attributes = True
