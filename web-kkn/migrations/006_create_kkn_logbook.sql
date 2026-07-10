CREATE TABLE IF NOT EXISTS kkn_logbook (
  id SERIAL PRIMARY KEY,
  mahasiswa_id INTEGER NOT NULL REFERENCES kkn_mahasiswa(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL,
  kegiatan VARCHAR(150) NOT NULL,
  deskripsi TEXT,
  foto_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_logbook_tanggal ON kkn_logbook (tanggal);
