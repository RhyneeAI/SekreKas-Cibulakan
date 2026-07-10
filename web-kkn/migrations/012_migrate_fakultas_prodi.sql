-- Seed fakultas
INSERT INTO kkn_fakultas (nama) VALUES
  ('Fakultas Teknik'),
  ('Fakultas Hukum'),
  ('Fakultas Ekonomi dan Bisnis Islam (FEBI)'),
  ('Fakultas Keguruan dan Ilmu Pengetahuan'),
  ('Fakultas Sains Terapan')
ON CONFLICT (nama) DO NOTHING;

-- Seed prodi
INSERT INTO kkn_prodi (fakultas_id, nama)
SELECT f.id, p.nama
FROM (VALUES
  ('Fakultas Teknik', 'Informatika'),
  ('Fakultas Teknik', 'Sipil'),
  ('Fakultas Teknik', 'Industri'),
  ('Fakultas Hukum', 'Ilmu Hukum'),
  ('Fakultas Ekonomi dan Bisnis Islam (FEBI)', 'Ekonomi Syariah'),
  ('Fakultas Ekonomi dan Bisnis Islam (FEBI)', 'Perbankan Syariah'),
  ('Fakultas Ekonomi dan Bisnis Islam (FEBI)', 'Akuntansi Syariah'),
  ('Fakultas Keguruan dan Ilmu Pengetahuan', 'Pendidikan Jasmani dan Rohani (PJKR)'),
  ('Fakultas Keguruan dan Ilmu Pengetahuan', 'Pendidikan Bahasa Inggris'),
  ('Fakultas Keguruan dan Ilmu Pengetahuan', 'Pendidikan Bahasa dan Sastra Indonesia'),
  ('Fakultas Sains Terapan', 'Agribisnis')
) AS p(fakultas_nama, nama)
JOIN kkn_fakultas f ON f.nama = p.fakultas_nama
ON CONFLICT (fakultas_id, nama) DO NOTHING;

-- Tambah FK prodi di mahasiswa
ALTER TABLE kkn_mahasiswa
  ADD COLUMN IF NOT EXISTS prodi_id INTEGER REFERENCES kkn_prodi(id) ON DELETE SET NULL;

-- Mapping mahasiswa → prodi (by NIM)
UPDATE kkn_mahasiswa m
SET prodi_id = p.id
FROM kkn_prodi p
JOIN kkn_fakultas f ON f.id = p.fakultas_id
WHERE m.nim = 'KKN-001' AND f.nama = 'Fakultas Teknik' AND p.nama = 'Informatika';

UPDATE kkn_mahasiswa m SET prodi_id = p.id FROM kkn_prodi p JOIN kkn_fakultas f ON f.id = p.fakultas_id
WHERE m.nim = 'KKN-002' AND f.nama = 'Fakultas Hukum' AND p.nama = 'Ilmu Hukum';

UPDATE kkn_mahasiswa m SET prodi_id = p.id FROM kkn_prodi p JOIN kkn_fakultas f ON f.id = p.fakultas_id
WHERE m.nim = 'KKN-003' AND f.nama = 'Fakultas Ekonomi dan Bisnis Islam (FEBI)' AND p.nama = 'Ekonomi Syariah';

UPDATE kkn_mahasiswa m SET prodi_id = p.id FROM kkn_prodi p JOIN kkn_fakultas f ON f.id = p.fakultas_id
WHERE m.nim = 'KKN-004' AND f.nama = 'Fakultas Teknik' AND p.nama = 'Informatika';

UPDATE kkn_mahasiswa m SET prodi_id = p.id FROM kkn_prodi p JOIN kkn_fakultas f ON f.id = p.fakultas_id
WHERE m.nim = 'KKN-005' AND f.nama = 'Fakultas Ekonomi dan Bisnis Islam (FEBI)' AND p.nama = 'Perbankan Syariah';

UPDATE kkn_mahasiswa m SET prodi_id = p.id FROM kkn_prodi p JOIN kkn_fakultas f ON f.id = p.fakultas_id
WHERE m.nim = 'KKN-006' AND f.nama = 'Fakultas Ekonomi dan Bisnis Islam (FEBI)' AND p.nama = 'Ekonomi Syariah';

UPDATE kkn_mahasiswa m SET prodi_id = p.id FROM kkn_prodi p JOIN kkn_fakultas f ON f.id = p.fakultas_id
WHERE m.nim = 'KKN-007' AND f.nama = 'Fakultas Keguruan dan Ilmu Pengetahuan' AND p.nama = 'Pendidikan Jasmani dan Rohani (PJKR)';

UPDATE kkn_mahasiswa m SET prodi_id = p.id FROM kkn_prodi p JOIN kkn_fakultas f ON f.id = p.fakultas_id
WHERE m.nim = 'KKN-008' AND f.nama = 'Fakultas Sains Terapan' AND p.nama = 'Agribisnis';

UPDATE kkn_mahasiswa m SET prodi_id = p.id FROM kkn_prodi p JOIN kkn_fakultas f ON f.id = p.fakultas_id
WHERE m.nim = 'KKN-009' AND f.nama = 'Fakultas Ekonomi dan Bisnis Islam (FEBI)' AND p.nama = 'Akuntansi Syariah';

UPDATE kkn_mahasiswa m SET prodi_id = p.id FROM kkn_prodi p JOIN kkn_fakultas f ON f.id = p.fakultas_id
WHERE m.nim = 'KKN-010' AND f.nama = 'Fakultas Teknik' AND p.nama = 'Sipil';

UPDATE kkn_mahasiswa m SET prodi_id = p.id FROM kkn_prodi p JOIN kkn_fakultas f ON f.id = p.fakultas_id
WHERE m.nim = 'KKN-011' AND f.nama = 'Fakultas Hukum' AND p.nama = 'Ilmu Hukum';

UPDATE kkn_mahasiswa m SET prodi_id = p.id FROM kkn_prodi p JOIN kkn_fakultas f ON f.id = p.fakultas_id
WHERE m.nim = 'KKN-012' AND f.nama = 'Fakultas Keguruan dan Ilmu Pengetahuan' AND p.nama = 'Pendidikan Bahasa Inggris';

UPDATE kkn_mahasiswa m SET prodi_id = p.id FROM kkn_prodi p JOIN kkn_fakultas f ON f.id = p.fakultas_id
WHERE m.nim = 'KKN-013' AND f.nama = 'Fakultas Teknik' AND p.nama = 'Informatika';

UPDATE kkn_mahasiswa m SET prodi_id = p.id FROM kkn_prodi p JOIN kkn_fakultas f ON f.id = p.fakultas_id
WHERE m.nim = 'KKN-014' AND f.nama = 'Fakultas Keguruan dan Ilmu Pengetahuan' AND p.nama = 'Pendidikan Bahasa dan Sastra Indonesia';

UPDATE kkn_mahasiswa m SET prodi_id = p.id FROM kkn_prodi p JOIN kkn_fakultas f ON f.id = p.fakultas_id
WHERE m.nim = 'KKN-015' AND f.nama = 'Fakultas Hukum' AND p.nama = 'Ilmu Hukum';

UPDATE kkn_mahasiswa m SET prodi_id = p.id FROM kkn_prodi p JOIN kkn_fakultas f ON f.id = p.fakultas_id
WHERE m.nim = 'KKN-016' AND f.nama = 'Fakultas Teknik' AND p.nama = 'Industri';

UPDATE kkn_mahasiswa m SET prodi_id = p.id FROM kkn_prodi p JOIN kkn_fakultas f ON f.id = p.fakultas_id
WHERE m.nim = 'KKN-017' AND f.nama = 'Fakultas Hukum' AND p.nama = 'Ilmu Hukum';

-- Hapus kolom lama
ALTER TABLE kkn_mahasiswa DROP COLUMN IF EXISTS fakultas_prodi;
