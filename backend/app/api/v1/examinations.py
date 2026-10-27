from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.models.examination import Examination
from app.models.ai_prediction import AIPrediction
from app.models.enums import UserRole, DiseaseType, ExaminationStatus
from app.schemas.examination import ExaminationListItem, ExaminationDetailOut, ExaminationAssignRequest
from app.schemas.ai import AIPredictionOut
from app.schemas.verification import VerificationOut
from app.services.storage import save_medical_image
from app.services.assignment import assign_examination
from app.services.ai_engine import run_ai_prediction

router = APIRouter(prefix="/examinations", tags=["Pemeriksaan Medis (Examinations)"])

def serialize_examination(exam: Examination) -> ExaminationDetailOut:
    """Helper untuk menyusun detail pemeriksaan lengkap dengan relasi AI dan Verifikasi."""
    ai_out = None
    if exam.ai_prediction:
        ai_out = AIPredictionOut(
            id=exam.ai_prediction.id,
            examination_id=exam.ai_prediction.examination_id,
            model_version=exam.ai_prediction.model_version,
            predicted_result=exam.ai_prediction.predicted_result,
            probability=exam.ai_prediction.probability,
            inference_ms=exam.ai_prediction.inference_ms,
            created_at=exam.ai_prediction.created_at
        )

    verif_out = None
    if exam.verification:
        verif_out = VerificationOut(
            id=exam.verification.id,
            examination_id=exam.verification.examination_id,
            radiologist_id=exam.verification.radiologist_id,
            decision=exam.verification.decision,
            final_result=exam.verification.final_result,
            notes=exam.verification.notes,
            verified_at=exam.verification.verified_at,
            radiologist_name=exam.verification.radiologist.name if exam.verification.radiologist else None
        )

    return ExaminationDetailOut(
        id=exam.id,
        uploaded_by=exam.uploaded_by,
        uploader_name=exam.uploader.name if exam.uploader else None,
        assigned_radiologist_id=exam.assigned_radiologist_id,
        assigned_radiologist_name=exam.assigned_radiologist.name if exam.assigned_radiologist else None,
        disease_type=exam.disease_type,
        image_path=f"/uploads/{exam.image_path}",
        status=exam.status,
        created_at=exam.created_at,
        assigned_at=exam.assigned_at,
        ai_prediction=ai_out,
        verification=verif_out
    )


@router.post("/upload", response_model=ExaminationDetailOut, status_code=status.HTTP_201_CREATED)
def upload_examination(
    image: UploadFile = File(..., description="Berkas citra medis (JPG/PNG)"),
    disease_type: DiseaseType = Form(..., description="pneumonia | bone_cancer | brain_tumor"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mengunggah citra medis baru oleh pihak Faskes.
    Membuat record pemeriksaan baru berstatus 'uploaded'.
    """
    rel_path = save_medical_image(image, disease_type.value)

    new_exam = Examination(
        uploaded_by=current_user.id,
        disease_type=disease_type,
        image_path=rel_path,
        status=ExaminationStatus.uploaded
    )
    db.add(new_exam)
    db.commit()
    db.refresh(new_exam)

    return serialize_examination(new_exam)


@router.post("/{examination_id}/analyze", response_model=ExaminationDetailOut)
def analyze_examination(
    examination_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Menjalankan inferensi AI pada citra pemeriksaan.
    Menyimpan hasil ke tabel ai_predictions dan mengubah status menjadi 'analyzed'.
    """
    exam = db.query(Examination).filter(Examination.id == examination_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pemeriksaan tidak ditemukan")

    pred_data = run_ai_prediction(exam)

    ai_pred = db.query(AIPrediction).filter(AIPrediction.examination_id == exam.id).first()
    if not ai_pred:
        ai_pred = AIPrediction(
            examination_id=exam.id,
            model_version=pred_data["model_version"],
            predicted_result=pred_data["predicted_result"],
            probability=pred_data["probability"],
            inference_ms=pred_data["inference_ms"]
        )
        db.add(ai_pred)
    else:
        ai_pred.model_version = pred_data["model_version"]
        ai_pred.predicted_result = pred_data["predicted_result"]
        ai_pred.probability = pred_data["probability"]
        ai_pred.inference_ms = pred_data["inference_ms"]

    exam.status = ExaminationStatus.analyzed
    db.commit()
    db.refresh(exam)

    return serialize_examination(exam)


@router.post("/{examination_id}/assign", response_model=ExaminationDetailOut)
def assign_examination_endpoint(
    examination_id: int,
    req: ExaminationAssignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Menugaskan pemeriksaan ke dokter radiologi:
    - mode: 'automatic' (least-queue load balancing)
    - mode: 'manual' (dengan radiologist_id)
    """
    exam = db.query(Examination).filter(Examination.id == examination_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pemeriksaan tidak ditemukan")

    updated = assign_examination(
        examination=exam,
        mode=req.mode,
        radiologist_id=req.radiologist_id,
        db=db
    )
    return serialize_examination(updated)


@router.post("/{examination_id}/finalize", response_model=ExaminationDetailOut)
def finalize_examination(
    examination_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Faskes menyetujui hasil verifikasi dokter dan menandai status 'finalized'.
    """
    exam = db.query(Examination).filter(Examination.id == examination_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pemeriksaan tidak ditemukan")

    if exam.status != ExaminationStatus.verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Pemeriksaan harus berstatus 'verified' sebelum di-finalize (Status saat ini: {exam.status.value})"
        )

    exam.status = ExaminationStatus.finalized
    db.commit()
    db.refresh(exam)

    return serialize_examination(exam)


@router.get("/", response_model=List[ExaminationListItem])
def list_examinations(
    status_filter: Optional[ExaminationStatus] = None,
    disease_filter: Optional[DiseaseType] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Tampilan tabel/list riwayat pemeriksaan medis.
    """
    query = db.query(Examination)

    if current_user.role == UserRole.faskes:
        query = query.filter(Examination.uploaded_by == current_user.id)

    if status_filter:
        query = query.filter(Examination.status == status_filter)
    if disease_filter:
        query = query.filter(Examination.disease_type == disease_filter)

    exams = query.order_by(Examination.created_at.desc()).all()

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
            assigned_radiologist_name=e.assigned_radiologist.name if e.assigned_radiologist else None,
            predicted_result=e.ai_prediction.predicted_result if e.ai_prediction else None,
            final_result=e.verification.final_result if e.verification else None,
            created_at=e.created_at,
            assigned_at=e.assigned_at
        ))
    return items


@router.get("/{examination_id}", response_model=ExaminationDetailOut)
def get_examination_detail(
    examination_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mengambil detail satu pemeriksaan medis."""
    exam = db.query(Examination).filter(Examination.id == examination_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pemeriksaan tidak ditemukan")
    return serialize_examination(exam)
