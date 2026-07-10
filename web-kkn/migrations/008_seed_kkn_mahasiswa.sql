INSERT INTO kkn_mahasiswa (nama, nim, jabatan) VALUES
  ('Muhammad Hasby Ash Shiddiqie', 'KKN-001', 'Ketua Umum'),
  ('Moch Rifki Mulyana', 'KKN-002', 'Wakil Ketua'),
  ('Hani Ainunisa', 'KKN-003', 'Sekretaris'),
  ('Luhung Lugina', 'KKN-004', 'Sekretaris'),
  ('Ira Nurhayati', 'KKN-005', 'Bendahara'),
  ('Marlina Sifa Sulaeman', 'KKN-006', 'Divisi Acara'),
  ('Aulia Herawati Hermawan', 'KKN-007', 'Divisi Logistik'),
  ('Muhammad Sultan Fadilah', 'KKN-008', 'Divisi Acara'),
  ('Rima Agustina', 'KKN-009', 'Divisi Acara'),
  ('Muhammad Syahrial Fauzian', 'KKN-010', 'Divisi HUMAS'),
  ('Natasya Insani Auliarrahma', 'KKN-011', 'Divisi PDD'),
  ('Ajeng Maulida', 'KKN-012', 'Divisi PDD'),
  ('Vinna Laila Luqiana', 'KKN-013', 'Divisi PDD'),
  ('Sulistia Nursyamsyiah Adawiyah', 'KKN-014', 'Divisi HUMAS'),
  ('Asad Mubarok', 'KKN-015', 'Anggota'),
  ('Mochamad Gilang Pratama', 'KKN-016', 'Divisi Logistik'),
  ('Satiman', 'KKN-017', 'Anggota')
ON CONFLICT (nim) DO UPDATE SET
  nama = EXCLUDED.nama,
  jabatan = EXCLUDED.jabatan;
