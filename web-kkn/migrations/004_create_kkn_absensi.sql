CREATE TABLE IF NOT EXISTS kkn_absensi (
  id SERIAL PRIMARY KEY,
  mahasiswa_id INTEGER NOT NULL REFERENCES kkn_mahasiswa(id) ON DELETE CASCADE,
  uuid VARCHAR(36) NOT NULL,
  tanggal DATE NOT NULL,
  waktu_masuk TIME NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (mahasiswa_id, tanggal)
);

CREATE INDEX IF NOT EXISTS idx_absensi_tanggal ON kkn_absensi (tanggal);
