from typing import Optional
from datetime import datetime, timezone
from sqlalchemy import func, and_
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.models.examination import Examination
from app.models.enums import UserRole, ExaminationStatus

def find_least_loaded_radiologist(db: Session) -> User:
    """
    Algoritma Automatic Load Balancing:
    Mencari dokter radiologi dengan jumlah antrean tugas aktif (status 'analyzed')
    paling sedikit.
    """
    pending_count = func.count(Examination.id).label("pending_count")
    query = (
        db.query(
            User,
            pending_count
        )
        .outerjoin(
            Examination,
            and_(
                Examination.assigned_radiologist_id == User.id,
                Examination.status == ExaminationStatus.analyzed
            )
        )
        .filter(User.role == UserRole.radiologist)
        .group_by(User.id)
        .order_by(pending_count.asc(), User.id.asc())
    )

    result = query.first()
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tidak ada dokter radiologi yang terdaftar di sistem."
        )
    return result[0]


def assign_examination(
    examination: Examination,
    mode: str,
    db: Session,
    radiologist_id: Optional[int] = None
) -> Examination:
    """
    Menugaskan pemeriksaan ke dokter radiologi (Manual atau Automatic).
    """
    target_radiologist: Optional[User] = None

    if mode.lower() == "manual":
        if not radiologist_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mode manual wajib menyertakan 'radiologist_id'."
            )
        target_radiologist = db.query(User).filter(
            User.id == radiologist_id,
            User.role == UserRole.radiologist
        ).first()
        if not target_radiologist:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Dokter radiologi dengan id {radiologist_id} tidak ditemukan."
            )

    elif mode.lower() == "automatic":
        target_radiologist = find_least_loaded_radiologist(db)

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mode penugasan harus 'manual' atau 'automatic'."
        )

    examination.assigned_radiologist_id = target_radiologist.id
    examination.assigned_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(examination)
    return examination
