# Teleradiologi.AI — Backend

FastAPI + SQLAlchemy + PostgreSQL. Schema database dikelola oleh **Alembic**; model di `app/models/` adalah satu-satunya sumber kebenaran.

## Setup pertama kali

Butuh Python 3.10+ dan Docker Desktop.

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env          # lalu isi SECRET_KEY (cara membuatnya ada di dalam file)
docker compose up -d          # PostgreSQL 16 di localhost:5432
alembic upgrade head          # buat semua tabel
python seed_demo.py           # isi data demo (hanya untuk development)
uvicorn app.main:app --reload # http://localhost:8000/docs
```

Kredensial Postgres lokal: user `teleradiologi`, password `teleradiologi_dev`, database `teleradiologi`.
Akun demo ada di `seed_demo.py` (password semuanya `password123`).

## Mengubah schema

1. Ubah model di `app/models/`.
2. `alembic revision --autogenerate -m "deskripsi singkat"`
3. Periksa file di `alembic/versions/` (autogenerate tidak sempurna), lalu `alembic upgrade head`.
4. Commit model **dan** file migration bersamaan.

Jangan mengubah database lewat SQL manual atau `Base.metadata.create_all`.

## Test

```bash
pytest
```

Test memakai SQLite sementara (lihat `tests/conftest.py`), jadi aman dijalankan tanpa menyentuh database Postgres development.

## Catatan

- `.env`, `*.db`, dan isi `uploads/images/` tidak di-commit.
- File citra tidak disimpan di database; hanya path relatifnya di `examinations.image_path`.
