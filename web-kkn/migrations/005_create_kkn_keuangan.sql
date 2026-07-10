CREATE TABLE IF NOT EXISTS kkn_keuangan (
  id SERIAL PRIMARY KEY,
  mahasiswa_id_input INTEGER NOT NULL REFERENCES kkn_mahasiswa(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL,
  jenis TEXT NOT NULL CHECK (jenis IN ('masuk', 'keluar')),
  nominal DECIMAL(12, 2) NOT NULL,
  kategori VARCHAR(50),
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_keuangan_tanggal ON kkn_keuangan (tanggal);
CREATE INDEX IF NOT EXISTS idx_keuangan_kategori ON kkn_keuangan (kategori);
