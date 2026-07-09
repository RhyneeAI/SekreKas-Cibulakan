CREATE TABLE IF NOT EXISTS kkn_logbook (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  mahasiswa_id INT UNSIGNED NOT NULL,
  tanggal DATE NOT NULL,
  kegiatan VARCHAR(150) NOT NULL,
  deskripsi TEXT,
  foto_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mahasiswa_id) REFERENCES kkn_mahasiswa(id) ON DELETE CASCADE,
  INDEX idx_tanggal (tanggal)
);
