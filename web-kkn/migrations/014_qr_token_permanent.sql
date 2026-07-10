-- QR permanen: satu token, dipakai setiap hari (absensi tetap per tanggal)
DROP INDEX IF EXISTS idx_qr_token_tanggal;

ALTER TABLE kkn_qr_token
  ALTER COLUMN tanggal_berlaku DROP NOT NULL,
  ALTER COLUMN expired_at DROP NOT NULL;

-- Bersihkan token harian lama saja (jangan hapus token permanen)
DELETE FROM kkn_qr_token WHERE tanggal_berlaku IS NOT NULL;

INSERT INTO kkn_qr_token (token, tanggal_berlaku, expired_at)
SELECT encode(gen_random_bytes(16), 'hex'), NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM kkn_qr_token WHERE tanggal_berlaku IS NULL);

CREATE UNIQUE INDEX IF NOT EXISTS idx_qr_token_permanent
  ON kkn_qr_token ((1))
  WHERE tanggal_berlaku IS NULL;
