-- Satu QR token per hari (generate sekali, dipakai seharian)
CREATE UNIQUE INDEX IF NOT EXISTS idx_qr_token_tanggal ON kkn_qr_token (tanggal_berlaku);
