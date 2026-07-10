-- Anggota yang boleh masuk pool roulette piket (default: semua)
ALTER TABLE kkn_mahasiswa
  ADD COLUMN IF NOT EXISTS roulette_eligible BOOLEAN NOT NULL DEFAULT true;

-- Asad & Satiman (Anggota): tidak masuk roulette
UPDATE kkn_mahasiswa
SET roulette_eligible = false
WHERE nim IN ('KKN-015', 'KKN-017');
