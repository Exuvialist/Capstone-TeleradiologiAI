from datetime import datetime, timezone
from typing import Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.models.examination import Examination
from app.models.enums import UserRole, ExaminationStatus, DiseaseType
from app.schemas.dashboard import StatsResponse, DoctorWorkload

router = APIRouter(prefix="/dashboard", tags=["Dashboard Statistik"])

@router.get("/stats", response_model=StatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Statistik ringkas sistem:
    - Total pemeriksaan (keseluruhan, hari ini, bulan ini)
    - Rasio status (uploaded, analyzed, verified, finalized)
    - Jumlah dokter radiologi aktif dan beban antrean
    """
    now = datetime.now(timezone.utc)
    start_of_today = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
    start_of_month = datetime(now.year, now.month, 1, tzinfo=timezone.utc)

    total_examinations = db.query(Examination).count()
    total_uploaded = db.query(Examination).filter(Examination.status == ExaminationStatus.uploaded).count()
    total_analyzed = db.query(Examination).filter(Examination.status == ExaminationStatus.analyzed).count()
    total_verified = db.query(Examination).filter(Examination.status == ExaminationStatus.verified).count()
    total_finalized = db.query(Examination).filter(Examination.status == ExaminationStatus.finalized).count()

    examinations_today = db.query(Examination).filter(Examination.created_at >= start_of_today).count()
    examinations_this_month = db.query(Examination).filter(Examination.created_at >= start_of_month).count()

    radiologists = db.query(User).filter(User.role == UserRole.radiologist).all()

    workloads: List[DoctorWorkload] = []
    for rad in radiologists:
        pending = db.query(Examination).filter(
            Examination.assigned_radiologist_id == rad.id,
            Examination.status == ExaminationStatus.analyzed
        ).count()

        verified = db.query(Examination).filter(
            Examination.assigned_radiologist_id == rad.id,
            Examination.status.in_([ExaminationStatus.verified, ExaminationStatus.finalized])
        ).count()

        workloads.append(DoctorWorkload(
            doctor_id=rad.id,
            doctor_name=rad.name,
            pending_queue_count=pending,
            verified_cases_count=verified
        ))

    disease_counts: Dict[str, int] = {}
    for d in DiseaseType:
        disease_counts[d.value] = db.query(Examination).filter(Examination.disease_type == d).count()

    return StatsResponse(
        total_examinations=total_examinations,
        total_uploaded=total_uploaded,
        total_analyzed=total_analyzed,
        total_verified=total_verified,
        total_finalized=total_finalized,
        examinations_today=examinations_today,
        examinations_this_month=examinations_this_month,
        active_radiologists_count=len(radiologists),
        examinations_by_disease=disease_counts,
        doctor_workloads=workloads
    )
