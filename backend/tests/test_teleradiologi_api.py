import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.models.enums import UserRole, ExaminationStatus, DiseaseType, VerificationDecision, PredictionResult
from seed_demo import seed

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Menjalankan seeder sebelum test suite dieksekusi."""
    seed()
    yield

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "examinations" in data["endpoints"]

def test_auth_login_faskes_success():
    response = client.post("/api/v1/auth/login", json={
        "email": "faskes@puskesmas.id",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == UserRole.faskes.value
    assert data["email"] == "faskes@puskesmas.id"

def test_auth_login_invalid():
    response = client.post("/api/v1/auth/login", json={
        "email": "faskes@puskesmas.id",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_list_radiologists():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "faskes@puskesmas.id",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/v1/auth/radiologists", headers=headers)
    assert response.status_code == 200
    docs = response.json()
    assert len(docs) == 3
    doc_emails = [d["email"] for d in docs]
    assert "andi@radiologi.id" in doc_emails
    assert "budi@radiologi.id" in doc_emails
    assert "citra@radiologi.id" in doc_emails

def test_end_to_end_flow_examination():
    """
    PENGUJIAN ALUR LENGKAP END-TO-END (4 TABEL SESUAI DIAGRAM):
    1. Faskes upload citra & disease_type -> status: uploaded
    2. AI Trigger Analysis -> status: analyzed, tersimpan di ai_predictions
    3. Automatic Assignment -> Otomatis diarahkan ke dr. Citra (antrean 0)
    4. dr. Citra login & cek worklist
    5. dr. Citra verifikasi (decision: accept, final_result: positive) -> status: verified
    6. Faskes finalize -> status: finalized
    """
    # 1. Login Faskes
    faskes_login = client.post("/api/v1/auth/login", json={
        "email": "faskes@puskesmas.id",
        "password": "password123"
    })
    faskes_token = faskes_login.json()["access_token"]
    faskes_headers = {"Authorization": f"Bearer {faskes_token}"}

    # Buat file gambar dummy in-memory
    img_byte_arr = io.BytesIO()
    test_img = Image.new("RGB", (224, 224), color=(60, 90, 120))
    test_img.save(img_byte_arr, format="JPEG")
    img_byte_arr.seek(0)

    # 1. UPLOAD PEMERIKSAAN
    upload_res = client.post(
        "/api/v1/examinations/upload",
        headers=faskes_headers,
        data={
            "disease_type": DiseaseType.bone_cancer.value
        },
        files={
            "image": ("sample_bone.jpg", img_byte_arr, "image/jpeg")
        }
    )
    assert upload_res.status_code == 201
    exam_data = upload_res.json()
    exam_id = exam_data["id"]
    assert exam_data["status"] == ExaminationStatus.uploaded.value

    # 2. TRIGGER AI ANALYSIS
    analyze_res = client.post(f"/api/v1/examinations/{exam_id}/analyze", headers=faskes_headers)
    assert analyze_res.status_code == 200
    analyzed_data = analyze_res.json()
    assert analyzed_data["status"] == ExaminationStatus.analyzed.value
    assert analyzed_data["ai_prediction"] is not None
    assert analyzed_data["ai_prediction"]["probability"] > 0
    assert analyzed_data["ai_prediction"]["inference_ms"] < 10000

    # 3. AUTOMATIC LOAD BALANCING ASSIGNMENT
    assign_res = client.post(
        f"/api/v1/examinations/{exam_id}/assign",
        headers=faskes_headers,
        json={"mode": "automatic"}
    )
    assert assign_res.status_code == 200
    assigned_data = assign_res.json()
    # Harus dialokasikan ke dr. Citra karena beban aktifnya 0
    assert assigned_data["assigned_radiologist_name"] == "dr. Citra Lestari, Sp.Rad"
    assert assigned_data["assigned_at"] is not None

    # 4. dr. Citra LOGIN & CEK WORKLIST
    citra_login = client.post("/api/v1/auth/login", json={
        "email": "citra@radiologi.id",
        "password": "password123"
    })
    citra_token = citra_login.json()["access_token"]
    citra_headers = {"Authorization": f"Bearer {citra_token}"}

    worklist_res = client.get("/api/v1/radiologist/worklist", headers=citra_headers)
    assert worklist_res.status_code == 200
    worklist_ids = [w["id"] for w in worklist_res.json()]
    assert exam_id in worklist_ids

    # 5. dr. Citra VERIFIKASI
    verify_res = client.post(
        f"/api/v1/radiologist/examinations/{exam_id}/verify",
        headers=citra_headers,
        json={
            "decision": VerificationDecision.accept.value,
            "final_result": PredictionResult.positive.value,
            "notes": "Lesi litik terkonfirmasi pada korteks tulang."
        }
    )
    assert verify_res.status_code == 200
    verified_data = verify_res.json()
    assert verified_data["status"] == ExaminationStatus.verified.value
    assert verified_data["verification"]["decision"] == VerificationDecision.accept.value
    assert verified_data["verification"]["final_result"] == PredictionResult.positive.value

    # 6. Faskes FINALIZE
    finalize_res = client.post(f"/api/v1/examinations/{exam_id}/finalize", headers=faskes_headers)
    assert finalize_res.status_code == 200
    final_data = finalize_res.json()
    assert final_data["status"] == ExaminationStatus.finalized.value

def test_dashboard_stats():
    faskes_login = client.post("/api/v1/auth/login", json={
        "email": "faskes@puskesmas.id",
        "password": "password123"
    })
    token = faskes_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/dashboard/stats", headers=headers)
    assert res.status_code == 200
    stats = res.json()
    assert stats["total_examinations"] >= 5
    assert stats["active_radiologists_count"] == 3
    assert len(stats["doctor_workloads"]) == 3
    assert "bone_cancer" in stats["examinations_by_disease"]
