CREATE TABLE IF NOT EXISTS kkn_keuangan (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  mahasiswa_id_input INT UNSIGNED NOT NULL,
  tanggal DATE NOT NULL,
  jenis ENUM('masuk', 'keluar') NOT NULL,
  nominal DECIMAL(12,2) NOT NULL,
  kategori VARCHAR(50),
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mahasiswa_id_input) REFERENCES kkn_mahasiswa(id) ON DELETE CASCADE,
  INDEX idx_tanggal (tanggal),
  INDEX idx_kategori (kategori)
);
