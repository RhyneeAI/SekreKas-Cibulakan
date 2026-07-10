INSERT INTO kkn_mahasiswa (nama, nim, jabatan, fakultas_prodi) VALUES
  ('Muhammad Hasby Ash Shiddiqie', 'KKN-001', 'Ketua Umum', 'Teknik/Prodi Informatika'),
  ('Moch Rifki Mulyana', 'KKN-002', 'Wakil Ketua', 'Hukum'),
  ('Hani Ainunisa', 'KKN-003', 'Sekretaris', 'Fakultas Ekonomi dan Bisnis Islam (FEBI)/Prodi Ekonomi Syariah'),
  ('Luhung Lugina', 'KKN-004', 'Sekretaris', 'Fakultas Teknik/Prodi Informatika'),
  ('Ira Nurhayati', 'KKN-005', 'Bendahara', 'Fakultas Ekonomi dan Bisnis Islam (FEBI)/Prodi Perbankan Syariah'),
  ('Marlina Sifa Sulaeman', 'KKN-006', 'Divisi Acara', 'Ekonomi dan Bisnis Islam (FEBI)/Prodi Ekonomi Syariah'),
  ('Aulia Herawati Hermawan', 'KKN-007', 'Divisi Logistik', 'Fakultas Keguruan dan Ilmu Pengetahuan/Prodi Pendidikan Jasmani dan Rohani (PJKR)'),
  ('Muhammad Sultan Fadilah', 'KKN-008', 'Divisi Acara', 'Fakultas Sains Terapan/Prodi Agribisnis'),
  ('Rima Agustina', 'KKN-009', 'Divisi Acara', 'Ekonomi dan Bisnis Islam (FEBI)/Prodi Akuntansi Syariah'),
  ('Muhammad Syahrial Fauzian', 'KKN-010', 'Divisi HUMAS', 'Teknik/Prodi Sipil'),
  ('Natasya Insani Auliarrahma', 'KKN-011', 'Divisi PDD', 'Hukum/Prodi Ilmu Hukum'),
  ('Ajeng Maulida', 'KKN-012', 'Divisi PDD', 'Fakultas Keguruan dan Ilmu Pengetahuan/Prodi Pendidikan Bahasa Inggris'),
  ('Vinna Laila Luqiana', 'KKN-013', 'Divisi PDD', 'Teknik/Prodi Informatika'),
  ('Sulistia Nursyamsyiah Adawiyah', 'KKN-014', 'Divisi HUMAS', 'Fakultas Keguruan dan Ilmu Pengetahuan/Prodi Pendidikan Bahasa dan Sastra Indonesia'),
  ('Asad Mubarok', 'KKN-015', 'Anggota', 'Hukum'),
  ('Mochamad Gilang Pratama', 'KKN-016', 'Divisi Logistik', 'Teknik/Prodi Industri'),
  ('Satiman', 'KKN-017', 'Anggota', 'Hukum')
ON CONFLICT (nim) DO UPDATE SET
  nama = EXCLUDED.nama,
  jabatan = EXCLUDED.jabatan,
  fakultas_prodi = EXCLUDED.fakultas_prodi;
