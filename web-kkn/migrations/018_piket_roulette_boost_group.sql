-- Boost chance per GRUP (bukan per orang): +12.5% dibagi ke semua anggota grup
CREATE TABLE IF NOT EXISTS kkn_piket_roulette_boost_group (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  boost_percent NUMERIC(5, 2) NOT NULL DEFAULT 12.5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kkn_piket_roulette_boost_member (
  group_id INTEGER NOT NULL REFERENCES kkn_piket_roulette_boost_group(id) ON DELETE CASCADE,
  mahasiswa_id INTEGER NOT NULL REFERENCES kkn_mahasiswa(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, mahasiswa_id)
);

-- Grup Sekretaris: Hani + Luhung, +12.5% chance untuk grup (bukan masing-masing)
INSERT INTO kkn_piket_roulette_boost_group (nama, boost_percent)
SELECT 'Sekretaris', 12.5
WHERE NOT EXISTS (
  SELECT 1 FROM kkn_piket_roulette_boost_group WHERE nama = 'Sekretaris'
);

INSERT INTO kkn_piket_roulette_boost_member (group_id, mahasiswa_id)
SELECT g.id, m.id
FROM kkn_piket_roulette_boost_group g
CROSS JOIN kkn_mahasiswa m
WHERE g.nama = 'Sekretaris' AND m.nim IN ('KKN-003', 'KKN-004')
ON CONFLICT DO NOTHING;

DROP TABLE IF EXISTS kkn_piket_roulette_boost;
