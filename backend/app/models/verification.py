from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import VerificationDecision, PredictionResult

class Verification(Base):
    __tablename__ = "verifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    examination_id = Column(Integer, ForeignKey("examinations.id", ondelete="CASCADE"), unique=True, nullable=False)
    radiologist_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    decision = Column(SQLEnum(VerificationDecision), nullable=False)
    final_result = Column(SQLEnum(PredictionResult), nullable=False)
    notes = Column(Text, nullable=False)
    verified_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relasi
    examination = relationship("Examination", back_populates="verification")
    radiologist = relationship("User", back_populates="verifications")
