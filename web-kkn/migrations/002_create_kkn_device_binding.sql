CREATE TABLE IF NOT EXISTS kkn_device_binding (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(36) NOT NULL UNIQUE,
  mahasiswa_id INT UNSIGNED NOT NULL,
  pin_hash VARCHAR(255) NOT NULL,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP NULL,
  FOREIGN KEY (mahasiswa_id) REFERENCES kkn_mahasiswa(id) ON DELETE CASCADE,
  INDEX idx_mahasiswa (mahasiswa_id)
);
