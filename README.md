# SekreKas Cibulakan

Monorepo berisi 2 project:
- `web-kkn/` — Next.js (web absensi `/absen` + seluruh backend API)
- `mobile-app/` — Expo (React Native) untuk Keuangan, Logbook, dan Rekap Absensi

## Setup

```bash
npm install
cp web-kkn/.env.example web-kkn/.env   # isi kredensial Supabase
npm run migrate                        # jalankan migration ke Supabase Postgres
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
- Deploy `web-kkn` ke Vercel (set env Supabase di dashboard Vercel)
