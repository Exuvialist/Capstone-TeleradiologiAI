import os

# Test memakai SQLite sementara agar tidak menyentuh database Postgres development.
# Harus di-set sebelum app diimpor.
os.environ["DATABASE_URL"] = "sqlite:///./test_teleradiologi.db"
os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-production")
os.environ["ENVIRONMENT"] = "development"
