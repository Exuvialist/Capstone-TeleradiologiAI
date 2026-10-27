-- =========================================================
-- Teleradiologi.AI — Basic Relational Schema (v0.2)
-- Target: PostgreSQL (localhost prototype)
-- Disesuaikan dengan PRD: tanpa data rekam medis pasien,
-- 3 model biner (Pneumonia, Bone Cancer, Brain Tumor),
-- verifikasi Accept / Reject / Modify.
-- =========================================================

-- ---------- ENUM types ----------
CREATE TYPE user_role AS ENUM ('faskes', 'radiologist');

CREATE TYPE disease_type AS ENUM (
    'pneumonia',    -- rontgen paru-paru
    'bone_cancer',  -- x-ray tulang
    'brain_tumor'   -- MRI otak
);

CREATE TYPE exam_status AS ENUM (
    'uploaded',               -- step 1-2: citra baru diupload
    'ready_for_verification', -- step 5: hasil AI sudah masuk
    'in_review',              -- step 6: sudah diassign ke radiologis (= masuk queue)
    'verified'                -- step 9: radiologis sudah verifikasi
);

CREATE TYPE ai_result AS ENUM ('positive', 'negative');

CREATE TYPE verification_decision AS ENUM ('accept', 'reject', 'modify');


-- ---------- 1. users ----------
-- Akun Faskes (klinik/puskesmas) dan Radiologis, dibedakan lewat role
CREATE TABLE users (
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,  -- nama faskes / nama dokter
    email          VARCHAR(100) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    role           user_role    NOT NULL,
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);


-- ---------- 2. examinations ----------
-- Satu upload citra = satu pemeriksaan. Tabel pusat yang dilacak status-nya.
-- Sekaligus berfungsi sebagai queue (status = 'in_review') dan history.
CREATE TABLE examinations (
    id                       SERIAL PRIMARY KEY,
    uploaded_by              INT NOT NULL REFERENCES users(id),  -- akun faskes
    assigned_radiologist_id  INT REFERENCES users(id),           -- diisi di step 6
    disease_type             disease_type NOT NULL,              -- menentukan model yang dipakai
    image_path               VARCHAR(255) NOT NULL,              -- path file di local storage
    status                   exam_status  NOT NULL DEFAULT 'uploaded',
    created_at               TIMESTAMP    NOT NULL DEFAULT NOW(),
    assigned_at              TIMESTAMP
);


-- ---------- 3. ai_predictions ----------
-- step 3-5: hasil inferensi model (1 pemeriksaan = 1 prediksi)
CREATE TABLE ai_predictions (
    id                SERIAL PRIMARY KEY,
    examination_id    INT NOT NULL UNIQUE REFERENCES examinations(id) ON DELETE CASCADE,
    model_version     VARCHAR(50)  NOT NULL,          -- mis. 'pneumonia_v1.pt'
    predicted_result  ai_result    NOT NULL,
    probability       NUMERIC(5,4) NOT NULL CHECK (probability BETWEEN 0 AND 1),
    inference_ms      INT,                            -- untuk success metric < 10 detik
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW()
);


-- ---------- 4. verifications ----------
-- step 8-10: keputusan radiologis (1 pemeriksaan = 1 verifikasi)
CREATE TABLE verifications (
    id               SERIAL PRIMARY KEY,
    examination_id   INT NOT NULL UNIQUE REFERENCES examinations(id) ON DELETE CASCADE,
    radiologist_id   INT NOT NULL REFERENCES users(id),
    decision         verification_decision NOT NULL,
    final_result     ai_result NOT NULL,   -- sama dengan AI jika accept, dibalik jika modify
    notes            TEXT,
    verified_at      TIMESTAMP NOT NULL DEFAULT NOW()
);


-- ---------- Indexes ----------
CREATE INDEX idx_exam_queue    ON examinations(assigned_radiologist_id, status);
CREATE INDEX idx_exam_uploader ON examinations(uploaded_by);


-- =========================================================
-- Contoh query
-- =========================================================

-- [Step 6] Load balancing: radiologis dengan queue terkecil
-- SELECT u.id, COUNT(e.id) AS queue_count
-- FROM users u
-- LEFT JOIN examinations e
--        ON e.assigned_radiologist_id = u.id AND e.status = 'in_review'
-- WHERE u.role = 'radiologist'
-- GROUP BY u.id
-- ORDER BY queue_count ASC, u.id ASC
-- LIMIT 1;

-- [Step 7b] Queue + file path untuk dashboard radiologis
-- SELECT e.id, e.disease_type, e.image_path,
--        ap.predicted_result, ap.probability
-- FROM examinations e
-- JOIN ai_predictions ap ON ap.examination_id = e.id
-- WHERE e.assigned_radiologist_id = $1 AND e.status = 'in_review'
-- ORDER BY e.assigned_at ASC;

-- [Step 10] History hasil untuk faskes
-- SELECT e.id, e.disease_type, ap.predicted_result, ap.probability,
--        v.decision, v.final_result, v.notes, v.verified_at
-- FROM examinations e
-- JOIN ai_predictions ap  ON ap.examination_id = e.id
-- LEFT JOIN verifications v ON v.examination_id = e.id
-- WHERE e.uploaded_by = $1
-- ORDER BY e.created_at DESC;
