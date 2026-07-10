CREATE TABLE IF NOT EXISTS kkn_device_binding (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(36) NOT NULL UNIQUE,
  mahasiswa_id INTEGER NOT NULL REFERENCES kkn_mahasiswa(id) ON DELETE CASCADE,
  pin_hash VARCHAR(255) NOT NULL,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS idx_device_binding_mahasiswa ON kkn_device_binding (mahasiswa_id);
