-- Konfigurasi jumlah orang per hari saat generate mingguan
ALTER TABLE kkn_jadwal_piket
  ADD COLUMN IF NOT EXISTS orang_per_hari INTEGER NOT NULL DEFAULT 1;
