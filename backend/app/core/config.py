import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Root path direktori backend
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "Teleradiologi AI Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "postgresql+psycopg2://teleradiologi:teleradiologi_dev@localhost:5432/teleradiologi"
    
    # JWT Auth
    SECRET_KEY: str  # wajib diisi lewat .env (lihat .env.example)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 hari
    
    # Upload Storage
    UPLOAD_DIR: str = str(BACKEND_DIR / "uploads")
    
    # Environment
    ENVIRONMENT: str = "development"

    class Config:
        env_file = str(BACKEND_DIR / ".env")
        case_sensitive = True

settings = Settings()

# Pastikan folder upload ada
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "images"), exist_ok=True)
