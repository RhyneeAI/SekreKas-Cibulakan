-- Boost chance roulette per anggota (persen tambahan, mis. 12.5 = +12.5%)
CREATE TABLE IF NOT EXISTS kkn_piket_roulette_boost (
  mahasiswa_id INTEGER PRIMARY KEY REFERENCES kkn_mahasiswa(id) ON DELETE CASCADE,
  boost_percent NUMERIC(5, 2) NOT NULL DEFAULT 12.5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hani (KKN-003) & Luhung (KKN-004): +12.5% chance
INSERT INTO kkn_piket_roulette_boost (mahasiswa_id, boost_percent)
SELECT id, 12.5 FROM kkn_mahasiswa WHERE nim IN ('KKN-003', 'KKN-004')
ON CONFLICT (mahasiswa_id) DO UPDATE SET boost_percent = EXCLUDED.boost_percent;
