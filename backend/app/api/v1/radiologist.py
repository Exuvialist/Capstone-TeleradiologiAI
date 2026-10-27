from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.deps import require_role
from app.models.user import User
from app.models.examination import Examination
from app.models.verification import Verification
from app.models.enums import UserRole, ExaminationStatus
from app.schemas.examination import ExaminationListItem, ExaminationDetailOut
from app.schemas.verification import VerificationCreate
from app.api.v1.examinations import serialize_examination

router = APIRouter(prefix="/radiologist", tags=["Portal Dokter Radiologi"])

@router.get("/worklist", response_model=List[ExaminationListItem])
def get_radiologist_worklist(
    status_filter: Optional[ExaminationStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.radiologist))
):
    """
    Tampilan tabel antrean kerja dokter radiologi:
    Mengambil daftar pemeriksaan yang ditugaskan ke dokter yang sedang login.
    """
    query = db.query(Examination).filter(
        Examination.assigned_radiologist_id == current_user.id
    )

    if status_filter:
        query = query.filter(Examination.status == status_filter)

    exams = query.order_by(Examination.created_at.asc()).all()

    items = []
    for e in exams:
        items.append(ExaminationListItem(
            id=e.id,
            disease_type=e.disease_type,
            image_path=f"/uploads/{e.image_path}",
            status=e.status,
            uploaded_by=e.uploaded_by,
            uploader_name=e.uploader.name if e.uploader else None,
            assigned_radiologist_id=e.assigned_radiologist_id,
            assigned_radiologist_name=current_user.name,
            predicted_result=e.ai_prediction.predicted_result if e.ai_prediction else None,
            final_result=e.verification.final_result if e.verification else None,
            created_at=e.created_at,
            assigned_at=e.assigned_at
        ))
    return items


@router.post("/examinations/{examination_id}/verify", response_model=ExaminationDetailOut)
def verify_examination(
    examination_id: int,
    verif_data: VerificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.radiologist))
):
    """
    Dokter Radiologi memverifikasi hasil AI:
    - decision: accept | reject | modify
    - final_result: positive | negative
    - notes: text catatan telaah
    - Mengubah status pemeriksaan menjadi 'verified'.
    """
    exam = db.query(Examination).filter(Examination.id == examination_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pemeriksaan tidak ditemukan")

    if exam.assigned_radiologist_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Pemeriksaan ini ditugaskan ke dokter radiologi lain."
        )

    existing_verif = db.query(Verification).filter(Verification.examination_id == exam.id).first()
    if not existing_verif:
        verif = Verification(
            examination_id=exam.id,
            radiologist_id=current_user.id,
            decision=verif_data.decision,
            final_result=verif_data.final_result,
            notes=verif_data.notes
        )
        db.add(verif)
    else:
        existing_verif.radiologist_id = current_user.id
        existing_verif.decision = verif_data.decision
        existing_verif.final_result = verif_data.final_result
        existing_verif.notes = verif_data.notes

    exam.status = ExaminationStatus.verified
    db.commit()
    db.refresh(exam)

    return serialize_examination(exam)
