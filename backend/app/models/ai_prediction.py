from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import PredictionResult

class AIPrediction(Base):
    __tablename__ = "ai_predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    examination_id = Column(Integer, ForeignKey("examinations.id", ondelete="CASCADE"), unique=True, nullable=False)
    model_version = Column(String(50), nullable=False)
    predicted_result = Column(SQLEnum(PredictionResult), nullable=False)
    probability = Column(Float, nullable=False)
    inference_ms = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relasi
    examination = relationship("Examination", back_populates="ai_prediction")
