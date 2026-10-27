# Teleradiologi.AI — Database (PostgreSQL)

Setup database lokal untuk prototipe. Semua anggota tim memakai versi yang sama (PostgreSQL 16) lewat Docker.

## Struktur

```
teleradiologi-db/
├── docker-compose.yml
└── db/
    ├── 01_schema.sql   # tabel, enum, index
    └── 02_seed.sql     # akun dummy untuk testing
```

## Menjalankan

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. Dari folder ini:

   ```bash
   docker compose up -d
   ```

3. Database siap di `localhost:5432`:

   | | |
   |---|---|
   | Database | `teleradiologi` |
   | User | `teleradiologi` |
   | Password | `teleradiologi_dev` |

   Connection string:
   ```
   postgresql://teleradiologi:teleradiologi_dev@localhost:5432/teleradiologi
   ```

4. Cek isinya:
   ```bash
   docker exec -it teleradiologi-db psql -U teleradiologi -c "SELECT id, name, role FROM users;"
   ```

## Akun dummy

Semua password: `password123` (hash bcrypt, bisa diverifikasi dengan `bcrypt`/`passlib` di Python).

| Email | Role |
|---|---|
| faskes1@test.local | faskes |
| faskes2@test.local | faskes |
| rad1@test.local | radiologist |
| rad2@test.local | radiologist |
| rad3@test.local | radiologist |

## Mengubah schema

File di `db/` **hanya dijalankan saat database pertama kali dibuat**. Setelah mengedit `01_schema.sql` atau `02_seed.sql`, reset database (data lama akan hilang):

```bash
docker compose down -v
docker compose up -d
```

Kalau nanti backend memakai migration tool (misalnya Alembic), jadikan migration sebagai satu-satunya sumber kebenaran dan berhenti mengedit `01_schema.sql` secara manual.

## Catatan

- File citra **tidak** disimpan di database. Simpan di folder lokal (mis. `storage/images/`) dan masukkan path relatifnya ke `examinations.image_path`.
- Contoh query untuk load balancing, queue radiologis, dan history faskes ada di bagian bawah `01_schema.sql`.
