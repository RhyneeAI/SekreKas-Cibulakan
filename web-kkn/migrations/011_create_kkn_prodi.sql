CREATE TABLE IF NOT EXISTS kkn_prodi (
  id SERIAL PRIMARY KEY,
  fakultas_id INTEGER NOT NULL REFERENCES kkn_fakultas(id) ON DELETE RESTRICT,
  nama VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (fakultas_id, nama)
);

CREATE INDEX IF NOT EXISTS idx_prodi_fakultas ON kkn_prodi (fakultas_id);
