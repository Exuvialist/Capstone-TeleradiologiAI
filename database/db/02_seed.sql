-- =========================================================
-- Seed data untuk development (localhost only)
-- Semua akun memakai password: password123
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (name, email, password_hash, role) VALUES
  ('Puskesmas Sleman',   'faskes1@test.local', crypt('password123', gen_salt('bf')), 'faskes'),
  ('Klinik Pratama Bantul', 'faskes2@test.local', crypt('password123', gen_salt('bf')), 'faskes'),
  ('dr. Radiologis A, Sp.Rad', 'rad1@test.local', crypt('password123', gen_salt('bf')), 'radiologist'),
  ('dr. Radiologis B, Sp.Rad', 'rad2@test.local', crypt('password123', gen_salt('bf')), 'radiologist'),
  ('dr. Radiologis C, Sp.Rad', 'rad3@test.local', crypt('password123', gen_salt('bf')), 'radiologist');
