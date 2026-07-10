# SKILL.md — Sistem Kesekretariatan & Bendahara KKN

## Konteks Project
Sistem internal untuk 1 kelompok KKN, terdiri dari 2 bagian terpisah:

1. **Absensi (Web, tanpa Auth)** — cross-platform (Android & iOS), diakses via browser, tidak perlu install apapun.
2. **Keuangan & Logbook (Mobile App, Android only)** — pencatatan kas kelompok dan logbook kegiatan harian, tidak ada approval/review flow.

Skala kecil, internal only, **hindari over-engineering**: tidak perlu role-based access, tidak perlu approval flow, tidak perlu proteksi enterprise-grade.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Web Absensi + Backend API | Next.js (App Router, API Routes) |
| Mobile App (Keuangan + Logbook) | React Native / Expo |
| Database | MySQL |

**Digabung jadi 1 project Next.js**: halaman web absensi (`/absen`) dan seluruh API (`/api/*`) hidup di aplikasi Next.js yang sama. Mobile app (Expo) tinggal hit endpoint `/api/*` dari Next.js ini seperti hit backend biasa. Jadi total cuma **2 codebase**: Next.js (web + API) dan Expo (mobile app) — tidak perlu Express terpisah.

### Struktur folder Next.js (App Router)
```
web-kkn/
├── app/
│   ├── absen/
│   │   └── page.tsx              # halaman scan + register device
│   └── api/
│       ├── absensi/
│       │   ├── register-device/route.ts
│       │   ├── verify-pin/route.ts
│       │   ├── check-in/route.ts
│       │   ├── qr-today/route.ts
│       │   └── rekap/route.ts
│       ├── keuangan/
│       │   └── route.ts          # GET, POST
│       │   └── [id]/route.ts     # PUT, DELETE
│       └── logbook/
│           └── route.ts
│           └── [id]/route.ts
├── lib/
│   ├── db.ts                     # koneksi MySQL (mysql2 / Prisma)
│   └── auth-device.ts            # helper verifikasi uuid/pin
├── migrations/
└── package.json
```

---

## Modul 1: Absensi (Web, Tanpa Auth)

### Konsep Utama
Tidak ada login/password. Identitas mahasiswa diikat ke **device** (browser) via kombinasi `UUID` (auto-generate) + `PIN` (dibuat manual sekali).

### Alur Lengkap

**A. First-time visit (device baru / localStorage kosong)**
1. Saat halaman absensi dibuka pertama kali, generate UUID di client, **belum langsung disimpan**.
2. Tampilkan form: pilih nama dari dropdown daftar anggota kelompok + buat PIN 4 digit.
3. Submit ke `POST /api/absensi/register-device`:
   - Body: `{ uuid, mahasiswa_id, pin }`
   - Backend hash PIN (bcrypt/argon2), simpan binding `uuid ↔ mahasiswa_id ↔ pin_hash`.
4. Jika sukses, simpan ke `localStorage`: `{ uuid, mahasiswa_id, nama }` (PIN **tidak** disimpan di localStorage — hanya dipakai sekali saat setup, atau saat perlu re-verifikasi).
5. Setelah ini, device dianggap "terdaftar" — tidak perlu isi ulang apapun.

**B. Scan QR (device sudah terdaftar / localStorage ada)**
1. User scan QR (isi QR = token harian, contoh: `{ qr_token }`, expired otomatis tiap hari).
2. App baca `uuid` + `mahasiswa_id` dari localStorage, langsung kirim ke `POST /api/absensi/check-in`:
   - Body: `{ uuid, qr_token }`
3. Backend validasi:
   - `qr_token` masih berlaku (belum expired)
   - `uuid` terdaftar di `kkn_device_binding` → resolve `mahasiswa_id`
   - Belum ada record absensi untuk `mahasiswa_id` + tanggal hari ini → insert
   - Kalau sudah ada → tolak dengan pesan "sudah absen hari ini"
4. Tidak ada input manual sama sekali di step ini — sekali tap/scan langsung selesai.

**C. Device baru / pindah browser (localStorage kosong tapi mahasiswa sudah pernah daftar)**
1. Karena tidak ada localStorage, sistem akan minta ulang: pilih nama + **masukkan PIN** (bukan buat PIN baru).
2. Submit ke `POST /api/absensi/verify-pin`:
   - Body: `{ mahasiswa_id, pin }`
3. Kalau PIN cocok → generate UUID baru untuk device ini, simpan binding baru (`uuid` baru, `mahasiswa_id` sama), simpan ke localStorage.
4. Kalau PIN salah → tolak, tidak ada reset otomatis (reset manual oleh admin/SC jika lupa PIN).

### Skema Database — Absensi

```sql
kkn_mahasiswa
- id
- nama
- nim

kkn_device_binding
- id
- uuid (unique)
- mahasiswa_id (FK)
- pin_hash
- registered_at
- last_used_at

kkn_absensi
- id
- mahasiswa_id (FK)
- uuid (device yang dipakai scan, untuk audit trail)
- tanggal
- waktu_masuk
- user_agent
- created_at

kkn_qr_token
- id
- token (unique, random string)
- tanggal_berlaku
- expired_at
```

### Endpoint Detail — Absensi

#### `POST /api/absensi/register-device`
First-time setup device baru.
```json
// Request
{ "uuid": "a1b2c3-...", "mahasiswa_id": 3, "pin": "1234" }

// Response 201
{ "success": true, "uuid": "a1b2c3-...", "mahasiswa_id": 3, "nama": "Luhung" }

// Response 409 (uuid atau mahasiswa sudah punya binding aktif)
{ "success": false, "message": "Device atau mahasiswa sudah terdaftar" }
```

#### `POST /api/absensi/verify-pin`
Re-bind device baru (localStorage kosong) pakai PIN yang sudah dibuat sebelumnya.
```json
// Request
{ "mahasiswa_id": 3, "pin": "1234" }

// Response 200
{ "success": true, "uuid": "new-uuid-generated-client-side", "mahasiswa_id": 3, "nama": "Luhung" }

// Response 401
{ "success": false, "message": "PIN salah" }
```
> Catatan: `uuid` baru sebaiknya di-generate di **client** (`crypto.randomUUID()`) lalu dikirim bersamaan di body request, backend tinggal insert binding baru dengan `uuid` tsb.

#### `POST /api/absensi/check-in`
```json
// Request
{ "uuid": "a1b2c3-...", "qr_token": "abcd1234" }

// Response 200
{ "success": true, "waktu_masuk": "2026-07-09T08:15:00+07:00" }

// Response 400 (qr_token expired/invalid)
{ "success": false, "message": "QR tidak valid atau sudah kedaluwarsa" }

// Response 409 (sudah absen hari ini)
{ "success": false, "message": "Sudah absen hari ini" }

// Response 404 (uuid tidak terdaftar)
{ "success": false, "message": "Device belum terdaftar", "action": "redirect_to_register" }
```

#### `GET /api/absensi/qr-today`
Dipanggil dari halaman admin/SC untuk menampilkan QR yang akan discan mahasiswa.
```json
// Response 200
{ "token": "abcd1234", "expired_at": "2026-07-09T23:59:59+07:00" }
```

#### `GET /api/absensi/rekap?tanggal=2026-07-09`
Dipakai di mobile app (menu baru "Absensi Hari Ini").
```json
// Response 200
{
  "tanggal": "2026-07-09",
  "data": [
    { "mahasiswa_id": 1, "nama": "Andi", "waktu_masuk": "08:02", "status": "hadir" },
    { "mahasiswa_id": 2, "nama": "Budi", "waktu_masuk": null, "status": "belum_absen" }
  ]
}
```

### Catatan Penting
- **PIN tidak pernah disimpan plaintext**, baik di server maupun di client.
- Tidak ada "lupa PIN" otomatis — kalau lupa, admin/SC reset manual lewat database/dashboard sederhana.
- QR token sebaiknya di-generate ulang tiap hari agar tidak bisa dipakai screenshot dari hari sebelumnya.
- Ini bukan sistem anti-fraud ketat — tujuannya administratif, bukan mencegah kecurangan tingkat tinggi.

---

## Modul 2: Keuangan & Logbook (Mobile App, Android)

### Prinsip
- Tidak ada approval/review — SC dan bendahara input langsung, dianggap final.
- Auth sederhana (bisa reuse `mahasiswa_id` dari absensi atau login simpel terpisah — didiskusikan saat development, belum final).

### Fitur A: Keuangan (Bendahara)
Catatan kas kolektif kelompok (bukan per-individu).

```sql
kkn_keuangan
- id
- kelompok_id (kalau cuma 1 kelompok, bisa di-skip / hardcode)
- mahasiswa_id_input (siapa yang input, untuk audit)
- tanggal
- jenis (masuk / keluar)
- nominal
- kategori (konsumsi, transportasi, dokumentasi, dll — bebas string atau enum sederhana)
- keterangan
- created_at
```

Fitur tambahan yang berguna:
- Rekap saldo berjalan (total masuk - total keluar) ditampilkan di halaman utama.
- Filter by tanggal / kategori.

### Fitur B: Logbook Kegiatan Harian (SC)
```sql
kkn_logbook
- id
- mahasiswa_id (siapa yang input/menjalankan kegiatan)
- tanggal
- kegiatan (judul singkat)
- deskripsi
- foto_url (opsional, upload ke storage lokal/cloud sederhana)
- created_at
```

Tidak ada status (`draft`/`approved`/dst) — begitu disubmit, langsung tercatat final. Bisa edit/hapus manual kalau ada typo.

### Fitur C: List Absensi Per Hari (menu baru di mobile app)
Read-only view, menarik data dari tabel `kkn_absensi` (dari sistem absensi web) lewat backend yang sama.

```
GET /api/absensi/rekap?tanggal=YYYY-MM-DD
→ return list mahasiswa + status hadir/tidak + jam masuk
```

UI sederhana: list per tanggal, nama mahasiswa, jam masuk, atau "belum absen" kalau tidak ada record.

### Endpoint Detail — Keuangan

#### `POST /api/keuangan`
```json
// Request
{
  "mahasiswa_id_input": 2,
  "tanggal": "2026-07-09",
  "jenis": "keluar",
  "nominal": 50000,
  "kategori": "konsumsi",
  "keterangan": "Beli snack rapat"
}
// Response 201 → { "success": true, "id": 12 }
```

#### `GET /api/keuangan?tanggal_awal=2026-07-01&tanggal_akhir=2026-07-31&kategori=konsumsi`
```json
// Response 200
{
  "saldo_berjalan": 350000,
  "total_masuk": 500000,
  "total_keluar": 150000,
  "data": [
    { "id": 12, "tanggal": "2026-07-09", "jenis": "keluar", "nominal": 50000, "kategori": "konsumsi", "keterangan": "Beli snack rapat", "input_oleh": "Budi" }
  ]
}
```

#### `PUT /api/keuangan/:id`
```json
{ "nominal": 55000, "keterangan": "Revisi nominal" }
// Response 200 → { "success": true }
```

#### `DELETE /api/keuangan/:id`
```json
// Response 200 → { "success": true }
```

---

### Endpoint Detail — Logbook

#### `POST /api/logbook`
```json
{
  "mahasiswa_id": 3,
  "tanggal": "2026-07-09",
  "kegiatan": "Sosialisasi program kerja",
  "deskripsi": "Sosialisasi ke warga RT 03 terkait program kerja bulan pertama",
  "foto_url": "https://.../foto1.jpg"
}
// Response 201 → { "success": true, "id": 8 }
```

#### `GET /api/logbook?tanggal_awal=2026-07-01&tanggal_akhir=2026-07-31`
```json
{
  "data": [
    { "id": 8, "tanggal": "2026-07-09", "nama": "Luhung", "kegiatan": "Sosialisasi program kerja", "deskripsi": "...", "foto_url": "..." }
  ]
}
```

#### `PUT /api/logbook/:id`
```json
{ "deskripsi": "Revisi deskripsi kegiatan" }
// Response 200 → { "success": true }
```

#### `DELETE /api/logbook/:id`
```json
// Response 200 → { "success": true }
```

---

### Ringkasan Semua Endpoint
```
POST   /api/absensi/register-device
POST   /api/absensi/verify-pin
POST   /api/absensi/check-in
GET    /api/absensi/qr-today
GET    /api/absensi/rekap

POST   /api/keuangan
GET    /api/keuangan
PUT    /api/keuangan/:id
DELETE /api/keuangan/:id

POST   /api/logbook
GET    /api/logbook
PUT    /api/logbook/:id
DELETE /api/logbook/:id
```

---

## Struktur Project Mobile App (Expo)

```
mobile-app/
└── screens/
    ├── KeuanganScreen.tsx
    ├── LogbookScreen.tsx
    └── AbsensiRekapScreen.tsx   # menu baru, konsumsi GET /api/absensi/rekap
```

---

## Migration SQL (MySQL)

```sql
-- migrations/001_create_kkn_mahasiswa.sql
CREATE TABLE kkn_mahasiswa (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  nim VARCHAR(30) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- migrations/002_create_kkn_device_binding.sql
CREATE TABLE kkn_device_binding (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(36) NOT NULL UNIQUE,
  mahasiswa_id INT UNSIGNED NOT NULL,
  pin_hash VARCHAR(255) NOT NULL,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP NULL,
  FOREIGN KEY (mahasiswa_id) REFERENCES kkn_mahasiswa(id) ON DELETE CASCADE,
  INDEX idx_mahasiswa (mahasiswa_id)
);

-- migrations/003_create_kkn_qr_token.sql
CREATE TABLE kkn_qr_token (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(64) NOT NULL UNIQUE,
  tanggal_berlaku DATE NOT NULL,
  expired_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- migrations/004_create_kkn_absensi.sql
CREATE TABLE kkn_absensi (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  mahasiswa_id INT UNSIGNED NOT NULL,
  uuid VARCHAR(36) NOT NULL,
  tanggal DATE NOT NULL,
  waktu_masuk TIME NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mahasiswa_id) REFERENCES kkn_mahasiswa(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_absen_harian (mahasiswa_id, tanggal),
  INDEX idx_tanggal (tanggal)
);

-- migrations/005_create_kkn_keuangan.sql
CREATE TABLE kkn_keuangan (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  mahasiswa_id_input INT UNSIGNED NOT NULL,
  tanggal DATE NOT NULL,
  jenis ENUM('masuk', 'keluar') NOT NULL,
  nominal DECIMAL(12,2) NOT NULL,
  kategori VARCHAR(50),
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mahasiswa_id_input) REFERENCES kkn_mahasiswa(id) ON DELETE CASCADE,
  INDEX idx_tanggal (tanggal),
  INDEX idx_kategori (kategori)
);

-- migrations/006_create_kkn_logbook.sql
CREATE TABLE kkn_logbook (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  mahasiswa_id INT UNSIGNED NOT NULL,
  tanggal DATE NOT NULL,
  kegiatan VARCHAR(150) NOT NULL,
  deskripsi TEXT,
  foto_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mahasiswa_id) REFERENCES kkn_mahasiswa(id) ON DELETE CASCADE,
  INDEX idx_tanggal (tanggal)
);
```

**Catatan migration:**
- `uniq_absen_harian` di `kkn_absensi` mencegah insert dobel di hari yang sama — ini yang jadi basis validasi "sudah absen hari ini" di endpoint check-in, bukan cuma dicek di kode aplikasi.
- `pin_hash` wajib disimpan hasil hash (bcrypt/argon2), tidak boleh plaintext.
- Kalau pakai Prisma, tabel-tabel di atas tinggal diterjemahkan ke `schema.prisma`; kalau pakai raw SQL/mysql2, file-file di atas langsung dieksekusi berurutan sesuai nomor.

---

## Hal yang Sengaja Tidak Dibuat (out of scope)
- Tidak ada role-based access control.
- Tidak ada approval flow untuk logbook.
- Tidak ada notifikasi push.
- Tidak ada device hardware ID (IDFV/Keychain) — cukup UUID + PIN karena device dianggap tidak berubah.
- Tidak ada proteksi anti-fraud tingkat lanjut (geofencing, dsb) kecuali diminta belakangan.


## Standarisasi Project

### Struktur & Penamaan
- Route API Next.js wajib pola `app/api/<resource>/route.ts` (list+create) dan `app/api/<resource>/[id]/route.ts` (update+delete). Jangan pakai `pages/api` lama.
- Semua nama tabel database wajib prefix `kkn_`.
- Penamaan file: kebab-case untuk folder, PascalCase untuk komponen React (`AbsensiRekapScreen.tsx`), camelCase untuk fungsi/variable, snake_case untuk kolom database.
- Setiap endpoint baru wajib mengikuti format response yang sudah ada: `{ success: boolean, message?: string, ...data }`.
- Jangan menambah dependency baru tanpa alasan jelas — cek dulu apakah sudah ada library serupa yang dipakai di project.

### Git Workflow
- Branch `main` selalu dalam kondisi stabil dan siap dipakai — jangan commit langsung ke `main`.
- Kerja harian di branch `dev`, merge ke `main` setelah fitur selesai dan sudah dicoba jalan.
- Fitur besar/berisiko pakai branch terpisah `feat/<nama-fitur>`, merge ke `dev` setelah selesai.
- Commit per unit kerja kecil dan logis — bukan satu commit besar di akhir sesi. Setiap perubahan yang bisa berdiri sendiri (1 endpoint, 1 screen, 1 migration) = 1 commit.
- Commit message pakai Conventional Commits ringan:
feat: tambah endpoint check-in absensi
fix: perbaiki validasi PIN kosong
chore: update migration keuangan
docs: update CLAUDE.md
refactor: rapikan struktur folder screens

- Sebelum mengakhiri sesi kerja otonom, pastikan semua perubahan sudah di-commit (jangan tinggalkan working directory kotor).

### Testing & Validasi Sebelum Commit
- Setiap endpoint baru wajib dicoba jalan (manual test via curl/Postman atau langsung dari UI) sebelum dianggap selesai.
- Migration baru wajib dicoba dijalankan (`npm run migrate`) di database lokal sebelum di-commit.
- Jangan modifikasi migration yang sudah pernah dijalankan/di-commit sebelumnya — buat file migration baru untuk perubahan skema.


## Standarisasi Desain (UI)

Prinsip: fungsional dan konsisten di atas segalanya — ini tools internal kelompok, bukan produk publik. Hindari over-design.

### Warna
Pakai palet terbatas, definisikan sekali lalu reuse di semua screen/halaman:
--color-primary:    #2563EB   (aksi utama: tombol simpan, tab aktif)
--color-success:    #16A34A   (transaksi masuk, status hadir)
--color-danger:     #DC2626   (transaksi keluar, hapus, error)
--color-text:       #1F2937   (teks utama)
--color-text-muted: #6B7280   (subtext, keterangan, timestamp)
--color-border:     #E5E7EB   (garis pembatas antar item)
--color-bg:         #FFFFFF   (background utama)

### Tipografi
- Satu font family aja: font sistem default (`system-ui` di web, default di React Native) — tidak perlu import font custom untuk tools internal.
- Skala ukuran terbatas: `12px` (subtext/caption), `14px` (body), `16px` (label/input), `20px` (heading section), `24px` (heading halaman).

### Layout & Komponen
- Spacing konsisten pakai kelipatan 4: `4, 8, 12, 16, 24, 32`.
- Semua input/button full-width di mobile (form absensi, keuangan, logbook) — hindari layout multi-kolom yang ribet di layar kecil.
- List item (transaksi, logbook, rekap absensi) selalu pola: judul/nama di kiri, info sekunder di kanan atau di bawahnya sebagai subtext, dipisah border tipis antar item (bukan card dengan shadow — terlalu berat untuk list panjang).
- Status pakai warna, bukan cuma teks: hijau untuk hadir/masuk, merah untuk keluar/belum, abu-abu untuk netral.

### Yang Sengaja Dihindari
- Jangan pakai gradient, shadow berlebihan, atau animasi kompleks — bikin app kerasa berat dan nggak perlu untuk tools internal.
- Jangan bikin desain custom per halaman — semua halaman (absensi, keuangan, logbook) harus terasa satu keluarga, pakai token warna & spacing yang sama.
- Jangan tambah dependency UI library besar (misal full component library) kecuali dependency yang sudah ada di boilerplate — cukup styling manual dengan StyleSheet (React Native) atau inline style/CSS module (Next.js).

### Warna (KKN Desa Cibulakan)
--color-bg:          #F5F1E1   (krem, background utama — dari background logo)
--color-primary:     #C68A3E   (kuning keemasan sinar matahari — aksi utama, tombol, tab aktif)
--color-secondary:   #8B5E3C   (coklat daun kanan — aksen sekunder, ikon)
--color-success:     #6E7F4F   (hijau daun kiri — transaksi masuk, status hadir)
--color-danger:      #A65B4A   (coklat kemerahan buku — transaksi keluar, hapus, error)
--color-text:         #4A3427   (coklat tua teks logo — teks utama, heading)
--color-text-muted:  #8B7A6B   (coklat keunguan halaman buku — subtext, keterangan)
--color-border:      #E3D9C4   (turunan krem lebih gelap — garis pembatas antar item)

**Catatan pemakaian:**
- `--color-bg` krem dipakai sebagai background utama di web absensi maupun mobile app — jangan pakai putih polos (`#FFFFFF`), krem ini yang jadi identitas visual.
- `--color-primary` (kuning keemasan) untuk tombol utama seperti "Scan QR & Absen", tab aktif di mobile app.
- `--color-success` (hijau) & `--color-danger` (coklat kemerahan) dipakai konsisten untuk status hadir/masuk vs keluar/belum — selaras dengan makna warna daun di logo (hijau = tumbuh/positif).
- `--color-text` coklat tua dipakai ganti hitam pekat (`#000000`) untuk semua teks — biar konsisten dengan nuansa hangat logo, bukan kontras tajam ala app modern generik.
- Logo sendiri ditaruh di header halaman `/absen` dan splash screen mobile app.