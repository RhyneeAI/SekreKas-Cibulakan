# Progress Check — SekreKas Cibulakan

Terakhir diperbarui: **10 Juli 2026**

Dokumen ini merangkum status implementasi project. Gunakan sebagai acuan sebelum lanjut development.

---

## Ringkasan Cepat

| Area | Status | Keterangan |
|---|---|---|
| **Web Absensi** | ✅ Selesai | UI + scanner + animasi |
| **Web Admin QR** | ✅ Selesai | Tampilkan QR harian |
| **Backend API** | ✅ Selesai | Absensi, keuangan, logbook |
| **Database (Supabase)** | ✅ Selesai | Postgres + seed 17 anggota |
| **Branding & UI Web** | ✅ Selesai | Palet Cibulakan, logo, favicon |
| **Mobile App** | 🟡 Parsial | Login pengurus done, tab screens basic |
| **Jadwal Piket** | ⬜ Belum | Direncanakan, belum diimplementasi |
| **Deploy Production** | ⬜ Belum | Vercel + env Supabase |

**Legenda:** ✅ Selesai · 🟡 Parsial · ⬜ Belum · 🔜 Berikutnya

---

## Tech Stack (Keputusan Final)

| Layer | Teknologi |
|---|---|
| Web + API | Next.js 15 (App Router) |
| Mobile | Expo / React Native |
| Database | **Supabase Postgres** (bukan MySQL/JSON) |
| Storage | Supabase Storage — bucket `logbook`, `finance` |
| Styling Web | Tailwind CSS, mobile-first |
| Auth Web Absen | UUID + PIN (tanpa login klasik) |
| Auth Mobile | PIN via `verify-pin` (sama dengan web) |

---

## Database

### Tabel (9 migration)

| # | Tabel | Status |
|---|---|---|
| 001 | `kkn_mahasiswa` | ✅ |
| 002 | `kkn_device_binding` | ✅ |
| 003 | `kkn_qr_token` | ✅ |
| 004 | `kkn_absensi` | ✅ |
| 005 | `kkn_keuangan` | ✅ |
| 006 | `kkn_logbook` | ✅ |
| 007 | `kkn_mahasiswa` + jabatan & fakultas_prodi | ✅ |
| 008 | Seed 17 anggota kelompok | ✅ |
| 009 | Ira Nurhayati → Bendahara | ✅ |
| 010 | `kkn_fakultas` | ✅ |
| 011 | `kkn_prodi` | ✅ |
| 012 | Migrasi `fakultas_prodi` → `prodi_id` FK | ✅ |

### Struktur Akademik

| Tabel | Relasi |
|---|---|
| `kkn_fakultas` | Master fakultas |
| `kkn_prodi` | FK → `kkn_fakultas` |
| `kkn_mahasiswa.prodi_id` | FK → `kkn_prodi` |


- **17 anggota** ter-seed (NIM placeholder `KKN-001` … `KKN-017`)
- **15 pengurus** bisa login mobile (exclude `Anggota`)
- Web absen dropdown: **nama saja** (tanpa jabatan)

---

## Modul 1: Absensi Web

| Fitur | Status | Catatan |
|---|---|---|
| Daftar device (nama + PIN) | ✅ | `POST /api/absensi/register-device` |
| Verifikasi PIN (device baru) | ✅ | `POST /api/absensi/verify-pin` |
| Scan QR & check-in | ✅ | `POST /api/absensi/check-in` |
| QR harian admin | ✅ | `/absen/admin` + `GET /api/absensi/qr-today` |
| Rekap absensi per hari | ✅ | `GET /api/absensi/rekap` |
| UI SekreKas (logo, krem, card) | ✅ | Mobile-first Tailwind |
| Animasi interaktif | ✅ | Scan overlay, pulse, success pop |
| Stop kamera saat batal | ✅ | MediaStream + scanner.stop |
| Preview kamera full box | ✅ | object-fit cover + qrbox dinamis |
| Favicon | ✅ | `app/icon.png` + metadata |

### Halaman Web

| URL | Status |
|---|---|
| `/absen` | ✅ |
| `/absen/admin` | ✅ (UI basic, belum animasi seperti `/absen`) |

---

## Modul 2: Backend API (Mobile & Web)

| Endpoint | Method | Status |
|---|---|---|
| `/api/mahasiswa` | GET | ✅ |
| `/api/mahasiswa?detail=1` | GET | ✅ Data lengkap |
| `/api/mahasiswa?pengurus=1` | GET | ✅ Filter login mobile |
| `/api/absensi/register-device` | POST | ✅ |
| `/api/absensi/verify-pin` | POST | ✅ |
| `/api/absensi/check-in` | POST | ✅ |
| `/api/absensi/qr-today` | GET | ✅ |
| `/api/absensi/rekap` | GET | ✅ |
| `/api/keuangan` | GET, POST | ✅ |
| `/api/keuangan/[id]` | PUT, DELETE | ✅ |
| `/api/logbook` | GET, POST | ✅ |
| `/api/logbook/[id]` | PUT, DELETE | ✅ |
| `/api/logbook/upload` | POST | ⬜ Belum — foto masih base64 |

---

## Modul 3: Mobile App

| Fitur | Status | Catatan |
|---|---|---|
| Login pengurus (PIN) | ✅ | UI selaras web, filter `?pengurus=1` |
| KeuanganScreen | 🟡 | CRUD basic, UI belum diseragamkan |
| LogbookScreen | 🟡 | CRUD + image picker, upload base64 |
| AbsensiRekapScreen | 🟡 | Read-only rekap |
| Expo Web | 🟡 | Deps terpasang, monorepo babel/metro fix |
| UI tab screens (tema Cibulakan) | ⬜ | Fokus web dulu |
| `API_BASE_URL` production | ⬜ | Masih hardcode IP lokal |

### Auth Mobile

- Login pakai **PIN yang sama** dengan web absensi
- Harus daftar PIN dulu di `/absen` sebelum bisa login mobile
- Hanya **pengurus** (bukan Anggota) yang muncul di picker

---

## Modul 4: Jadwal Piket (Belum Dimulai)

| Fitur | Status |
|---|---|
| Tabel `kkn_jadwal_piket` | ⬜ |
| Tabel `kkn_jadwal_piket_assign` | ⬜ |
| Tabel `kkn_absensi_piket` | ⬜ |
| CRUD jadwal (mobile/web admin) | ⬜ |
| Absen piket web (`/absen/piket`) | ⬜ |
| Rekap piket | ⬜ |

**Desain yang disepakati:**
- Multi orang per hari per jadwal
- Web absen piket tanpa login klasik (reuse UUID+PIN)
- Kelola jadwal via mobile (pengurus) atau web admin

---

## Infrastruktur & Deploy

| Item | Status | Catatan |
|---|---|---|
| Supabase project | ✅ | URL + keys di `.env` |
| Bucket `logbook` | ✅ | Dibuat di dashboard |
| Bucket `finance` | ✅ | Siap, belum dipakai |
| Migration script | ✅ | `npm run migrate` |
| Deploy Vercel | ⬜ | Env Supabase perlu di-set |
| `mobile-app` API URL production | ⬜ | Ganti setelah deploy web |

### Env yang Diperlukan (Vercel)

```
SUPABASE_URL
SUPABASE_SECRET_KEY
SUPABASE_PUBLISHABLE_KEY
SUPABASE_PROJECT_PW
SUPABASE_STORAGE_BUCKET_LOGBOOK=logbook
SUPABASE_STORAGE_BUCKET_FINANCE=finance
```

---

## Assets & Branding

| Asset | Lokasi | Status |
|---|---|---|
| Logo web | `web-kkn/public/logo.png` | ✅ |
| Favicon | `web-kkn/app/icon.png` | ✅ |
| Icon PWA | `web-kkn/public/icon-192.png`, `icon-512.png` | ✅ |
| Mobile icon/splash | `mobile-app/assets/` | ✅ |
| Palet warna Cibulakan | `tailwind.config.js` (web) | ✅ Web only |

---

## Yang Sengaja Out of Scope

- Role-based access control (RBAC)
- Approval flow logbook
- Push notification
- Anti-fraud (geofencing, hardware ID)
- Login username/password klasik di web

---

## Prioritas Berikutnya (Rekomendasi)

1. **Deploy web ke Vercel** — supaya API bisa diakses dari luar
2. **Upload foto logbook** ke Supabase Storage (ganti base64)
3. **UI `/absen/admin`** — selaraskan animasi dengan `/absen`
4. **Modul jadwal piket** — migration + API + halaman web
5. **Mobile UI** — seragamkan tab screens (setelah web stabil)

---

## Cara Update Dokumen Ini

Setelah menyelesaikan fitur, update baris status di tabel terkait dan tanggal di bagian atas.

```bash
# Cek migration terbaru
ls web-kkn/migrations/

# Cek endpoint yang ada
ls web-kkn/app/api/

# Cek halaman web
ls web-kkn/app/
```
