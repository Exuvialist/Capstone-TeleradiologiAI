from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import UserRole

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relasi
    uploaded_examinations = relationship(
        "Examination",
        back_populates="uploader",
        foreign_keys="Examination.uploaded_by"
    )
    assigned_examinations = relationship(
        "Examination",
        back_populates="assigned_radiologist",
        foreign_keys="Examination.assigned_radiologist_id"
    )
    verifications = relationship(
        "Verification",
        back_populates="radiologist"
    )
