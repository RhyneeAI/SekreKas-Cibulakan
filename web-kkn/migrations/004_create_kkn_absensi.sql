CREATE TABLE IF NOT EXISTS kkn_absensi (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  mahasiswa_id INT UNSIGNED NOT NULL,
  uuid VARCHAR(36) NOT NULL,
  tanggal DATE NOT NULL,
  waktu_masuk TIME NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mahasiswa_id) REFERENCES kkn_mahasiswa(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_absen_harian (mahasiswa_id, tanggal),
  INDEX idx_tanggal (tanggal)
);
