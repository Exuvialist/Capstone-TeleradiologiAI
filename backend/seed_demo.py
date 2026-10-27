import os
from datetime import datetime, timezone
from PIL import Image, ImageDraw

from app.core.database import SessionLocal, Base, engine
from app.core.security import hash_password
from app.core.config import settings
from app.models.user import User
from app.models.examination import Examination
from app.models.ai_prediction import AIPrediction
from app.models.verification import Verification
from app.models.enums import (
    UserRole,
    DiseaseType,
    ExaminationStatus,
    PredictionResult,
    VerificationDecision
)

def create_sample_image(folder_name: str, file_name: str, label_text: str) -> str:
    """Membuat citra dummy representatif untuk demo."""
    target_dir = os.path.join(settings.UPLOAD_DIR, "images", folder_name)
    os.makedirs(target_dir, exist_ok=True)
    file_path = os.path.join(target_dir, file_name)

    if not os.path.exists(file_path):
        img = Image.new("RGB", (400, 400), color=(25, 28, 36))
        d = ImageDraw.Draw(img)
        d.rectangle([40, 40, 360, 360], outline=(150, 160, 180), width=3)
        d.ellipse([120, 120, 280, 280], outline=(70, 180, 255), width=2)
        d.text((80, 20), f"CITRA: {label_text.upper()}", fill=(255, 255, 255))
        img.save(file_path, "JPEG")

    return f"images/{folder_name}/{file_name}"


def seed():
    print("--- [SEEDING DATABASE TELERADIOLOGI AI (4 TABEL)] ---")
    # Seeder menghapus semua data. Schema dibuat oleh Alembic (`alembic upgrade head`),
    # bukan di sini. Untuk keamanan, hanya boleh dijalankan di environment development.
    if settings.ENVIRONMENT != "development":
        raise RuntimeError("Seeder hanya boleh dijalankan saat ENVIRONMENT=development")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    default_pw_hash = hash_password("password123")

    # 1. SEED TABEL USERS (faskes & radiologist)
    # Akun Faskes
    faskes = User(
        name="Puskesmas Daerah 3T",
        email="faskes@puskesmas.id",
        password_hash=default_pw_hash,
        role=UserRole.faskes
    )

    # 3 Akun Radiologis untuk mendemonstrasikan Load Balancing
    # dr. Andi: beban awal 2 antrean aktif
    dr_andi = User(
        name="dr. Andi Pratama, Sp.Rad",
        email="andi@radiologi.id",
        password_hash=default_pw_hash,
        role=UserRole.radiologist
    )
    # dr. Budi: beban awal 1 antrean aktif
    dr_budi = User(
        name="dr. Budi Santoso, Sp.Rad",
        email="budi@radiologi.id",
        password_hash=default_pw_hash,
        role=UserRole.radiologist
    )
    # dr. Citra: beban awal 0 antrean aktif (TARGET AUTOMATIC LOAD BALANCING)
    dr_citra = User(
        name="dr. Citra Lestari, Sp.Rad",
        email="citra@radiologi.id",
        password_hash=default_pw_hash,
        role=UserRole.radiologist
    )

    db.add_all([faskes, dr_andi, dr_budi, dr_citra])
    db.commit()
    db.refresh(faskes)
    db.refresh(dr_andi)
    db.refresh(dr_budi)
    db.refresh(dr_citra)

    print("Berhasil membuat 4 akun pengguna (Password: password123):")
    print(f"  * Faskes     : {faskes.email} (id: {faskes.id})")
    print(f"  * Radiolog A : {dr_andi.email} (id: {dr_andi.id}, 2 antrean)")
    print(f"  * Radiolog B : {dr_budi.email} (id: {dr_budi.id}, 1 antrean)")
    print(f"  * Radiolog C : {dr_citra.email} (id: {dr_citra.id}, 0 antrean - TARGET LOAD BALANCING)")

    # 2. SEED CITRA MEDIS
    img_bone = create_sample_image("bone_cancer", "bone_sample.jpg", "Bone X-Ray")
    img_lung = create_sample_image("pneumonia", "chest_sample.jpg", "Chest X-Ray")
    img_brain = create_sample_image("brain_tumor", "brain_sample.jpg", "Brain MRI")

    now = datetime.now(timezone.utc)

    # 3. SEED TABEL EXAMINATIONS, AI_PREDICTIONS, & VERIFICATIONS
    # Kasus 1: Bone Cancer -> Ditugaskan ke dr_andi (status: analyzed / pending antrean)
    e1 = Examination(
        uploaded_by=faskes.id,
        assigned_radiologist_id=dr_andi.id,
        disease_type=DiseaseType.bone_cancer,
        image_path=img_bone,
        status=ExaminationStatus.analyzed,
        assigned_at=now
    )
    db.add(e1); db.flush()
    db.add(AIPrediction(
        examination_id=e1.id,
        model_version="efficientnet-b0-v1.0",
        predicted_result=PredictionResult.positive,
        probability=0.9234,
        inference_ms=640
    ))

    # Kasus 2: Pneumonia -> Ditugaskan ke dr_andi (status: analyzed / pending antrean ke-2)
    e2 = Examination(
        uploaded_by=faskes.id,
        assigned_radiologist_id=dr_andi.id,
        disease_type=DiseaseType.pneumonia,
        image_path=img_lung,
        status=ExaminationStatus.analyzed,
        assigned_at=now
    )
    db.add(e2); db.flush()
    db.add(AIPrediction(
        examination_id=e2.id,
        model_version="resnet50-v1.0",
        predicted_result=PredictionResult.positive,
        probability=0.8872,
        inference_ms=510
    ))

    # Kasus 3: Brain Tumor -> Ditugaskan ke dr_budi (status: analyzed / pending antrean ke-1)
    e3 = Examination(
        uploaded_by=faskes.id,
        assigned_radiologist_id=dr_budi.id,
        disease_type=DiseaseType.brain_tumor,
        image_path=img_brain,
        status=ExaminationStatus.analyzed,
        assigned_at=now
    )
    db.add(e3); db.flush()
    db.add(AIPrediction(
        examination_id=e3.id,
        model_version="custom-cnn-v1.0",
        predicted_result=PredictionResult.positive,
        probability=0.9415,
        inference_ms=780
    ))

    # Kasus 4: Bone Cancer -> Sudah diverifikasi oleh dr_budi (status: verified)
    e4 = Examination(
        uploaded_by=faskes.id,
        assigned_radiologist_id=dr_budi.id,
        disease_type=DiseaseType.bone_cancer,
        image_path=img_bone,
        status=ExaminationStatus.verified,
        assigned_at=now
    )
    db.add(e4); db.flush()
    db.add(AIPrediction(
        examination_id=e4.id,
        model_version="efficientnet-b0-v1.0",
        predicted_result=PredictionResult.positive,
        probability=0.9150,
        inference_ms=590
    ))
    db.add(Verification(
        examination_id=e4.id,
        radiologist_id=dr_budi.id,
        decision=VerificationDecision.accept,
        final_result=PredictionResult.positive,
        notes="Gambaran osteolitik agresif pada metafisis distal femur. Setuju dengan prediksi AI."
    ))

    # Kasus 5: Pneumonia -> Sudah di-finalize oleh Faskes (status: finalized)
    e5 = Examination(
        uploaded_by=faskes.id,
        assigned_radiologist_id=dr_citra.id,
        disease_type=DiseaseType.pneumonia,
        image_path=img_lung,
        status=ExaminationStatus.finalized,
        assigned_at=now
    )
    db.add(e5); db.flush()
    db.add(AIPrediction(
        examination_id=e5.id,
        model_version="resnet50-v1.0",
        predicted_result=PredictionResult.positive,
        probability=0.9610,
        inference_ms=490
    ))
    db.add(Verification(
        examination_id=e5.id,
        radiologist_id=dr_citra.id,
        decision=VerificationDecision.accept,
        final_result=PredictionResult.positive,
        notes="Infiltrat paru bilateral sesuai pneumonia lobaris aktif."
    ))

    db.commit()
    db.close()
    print("--- [SEEDING BERHASIL SELESAI!] ---")
    print("Data siap digunakan untuk pengujian alur fungsional dan demo.")

if __name__ == "__main__":
    seed()
