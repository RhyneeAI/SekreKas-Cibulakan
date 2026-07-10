CREATE TABLE IF NOT EXISTS kkn_jadwal_piket (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  tanggal_mulai DATE,
  tanggal_selesai DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kkn_jadwal_piket_assign (
  id SERIAL PRIMARY KEY,
  jadwal_id INTEGER NOT NULL REFERENCES kkn_jadwal_piket(id) ON DELETE CASCADE,
  mahasiswa_id INTEGER NOT NULL REFERENCES kkn_mahasiswa(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (jadwal_id, mahasiswa_id, tanggal)
);

CREATE INDEX IF NOT EXISTS idx_piket_assign_tanggal ON kkn_jadwal_piket_assign (tanggal);
CREATE INDEX IF NOT EXISTS idx_piket_assign_mahasiswa ON kkn_jadwal_piket_assign (mahasiswa_id, tanggal);

CREATE TABLE IF NOT EXISTS kkn_absensi_piket (
  id SERIAL PRIMARY KEY,
  assign_id INTEGER NOT NULL REFERENCES kkn_jadwal_piket_assign(id) ON DELETE CASCADE,
  mahasiswa_id INTEGER NOT NULL REFERENCES kkn_mahasiswa(id) ON DELETE CASCADE,
  jadwal_id INTEGER NOT NULL REFERENCES kkn_jadwal_piket(id) ON DELETE CASCADE,
  uuid VARCHAR(36) NOT NULL,
  tanggal DATE NOT NULL,
  waktu_masuk TIME NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (mahasiswa_id, jadwal_id, tanggal)
);
