from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import DiseaseType, ExaminationStatus

class Examination(Base):
    __tablename__ = "examinations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_radiologist_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    disease_type = Column(SQLEnum(DiseaseType), nullable=False)
    image_path = Column(String(500), nullable=False)
    status = Column(SQLEnum(ExaminationStatus), nullable=False, default=ExaminationStatus.uploaded, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    assigned_at = Column(DateTime(timezone=True), nullable=True)

    # Relasi
    uploader = relationship("User", foreign_keys=[uploaded_by], back_populates="uploaded_examinations")
    assigned_radiologist = relationship("User", foreign_keys=[assigned_radiologist_id], back_populates="assigned_examinations")
    
    ai_prediction = relationship("AIPrediction", back_populates="examination", uselist=False, cascade="all, delete-orphan")
    verification = relationship("Verification", back_populates="examination", uselist=False, cascade="all, delete-orphan")
