import os
import uuid
import shutil
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp"}
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB

def save_medical_image(upload_file: UploadFile, disease_type: str) -> str:
    """
    Menyimpan berkas citra medis yang diunggah ke direktori lokal terstruktur.
    Format direktori: uploads/images/{disease_type}/{uuid}.{ext}
    Mengembalikan relative file path untuk disimpan di database.
    """
    file_ext = Path(upload_file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Format berkas '{file_ext}' tidak didukung. Format yang diizinkan: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Buat direktori subfolder penyakit jika belum ada
    disease_folder = os.path.join(settings.UPLOAD_DIR, "images", disease_type.lower())
    os.makedirs(disease_folder, exist_ok=True)

    # Generate nama file unik dengan UUID
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    dest_path = os.path.join(disease_folder, unique_filename)

    # Simpan file ke disk
    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal menyimpan file citra ke penyimpanan lokal: {str(e)}"
        )

    # Return relative path yang konsisten (misal: images/bone_cancer/xxx.jpg)
    rel_path = os.path.relpath(dest_path, settings.UPLOAD_DIR).replace("\\", "/")
    return rel_path
