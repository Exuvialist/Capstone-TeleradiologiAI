import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger(__name__)

import socket
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger(__name__)

def is_port_open(host: str = "127.0.0.1", port: int = 5432, timeout: float = 1.0) -> bool:
    """Deteksi cepat (1 detik) apakah service database aktif di port target."""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except (socket.timeout, ConnectionRefusedError, OSError):
        return False

# Buat Engine SQLAlchemy
# Cek apakah PostgreSQL di localhost:5432 aktif
use_postgres = "postgresql" in settings.DATABASE_URL and is_port_open("127.0.0.1", 5432, timeout=1.0)

if use_postgres:
    try:
        engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 3},
            echo=False
        )
        print("[DATABASE] Terhubung ke database: PostgreSQL (localhost:5432)")
    except Exception as e:
        print(f"[DATABASE WARNING] Gagal inisialisasi PostgreSQL ({e}), beralih ke SQLite.")
        use_postgres = False

if not use_postgres:
    # Fallback instan ke SQLite tanpa delay
    print("[DATABASE INFO] PostgreSQL belum aktif. Menggunakan SQLite lokal (teleradiologi.db) agar aplikasi langsung jalan tanpa jeda.")
    engine = create_engine(
        "sqlite:///./teleradiologi.db",
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency injection untuk database session di FastAPI endpoint."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

