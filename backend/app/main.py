import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_v1_router

# Inisialisasi Tabel Database saat startup jika belum ada
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API Platform Teleradiologi Berbasis AI - Capstone Ilmu Komputer UGM",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Konfigurasi CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Files Mount untuk melayani berkas citra medis yang diunggah
uploads_path = settings.UPLOAD_DIR
os.makedirs(uploads_path, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")

# Hubungkan Router API v1
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health Check"])
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "endpoints": {
            "auth": f"{settings.API_V1_STR}/auth",
            "examinations": f"{settings.API_V1_STR}/examinations",
            "radiologist": f"{settings.API_V1_STR}/radiologist",
            "dashboard": f"{settings.API_V1_STR}/dashboard"
        }
    }
