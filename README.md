# Boilerplate Sistem KKN

Monorepo berisi 2 project:
- `web-kkn/` — Next.js (web absensi `/absen` + seluruh backend API)
- `mobile-app/` — Expo (React Native) untuk Keuangan, Logbook, dan Rekap Absensi

## Setup

```bash
npm install               # install semua dependencies (root monorepo)
cp web-kkn/.env.example web-kkn/.env   # isi kredensial MySQL
npm run migrate           # jalankan semua migration
```

## Menjalankan

```bash
npm run dev:web           # web → http://localhost:3001
npm run dev:mobile        # mobile → expo start
```

### Halaman Web
| URL | Fungsi |
|---|---|
| `/absen` | Scan QR absensi (mahasiswa) |
| `/absen/admin` | Lihat QR Code hari ini (admin/SC) |
| `/api/mahasiswa` | Daftar anggota kelompok |

## Yang masih perlu dilengkapi
- Auth sederhana di mobile app (saat ini `mahasiswa_id` masih hardcode `1`)
- Deploy `web-kkn` ke hosting (Vercel/VPS) supaya `mobile-app` bisa hit API dari luar
# SekreKas-Cibulakan
