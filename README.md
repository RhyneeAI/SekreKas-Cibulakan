# Boilerplate Sistem KKN

Berisi 2 project:
- `web-kkn/` — Next.js (web absensi `/absen` + seluruh backend API)
- `mobile-app/` — Expo (React Native) untuk Keuangan, Logbook, dan Rekap Absensi

Rancangan lengkap ada di `SKILL.md` (taruh di root masing-masing project atau jadikan `CLAUDE.md` supaya Claude Code langsung paham konteksnya).

## Setup web-kkn

```bash
cd web-kkn
npm install
cp .env.example .env   # isi kredensial MySQL kamu
npm run migrate        # jalankan semua migration
npm run dev            # jalan di http://localhost:3000
```

Halaman absensi: `http://localhost:3000/absen`

## Setup mobile-app

```bash
cd mobile-app
npm install
npx expo install       # sinkronkan versi native modules
npm start
```

Sebelum jalan, ubah `API_BASE_URL` di `lib/api.ts` ke alamat `web-kkn` kamu (kalau testing di HP fisik, ganti `localhost` dengan IP lokal komputer, misal `http://192.168.1.10:3000/api`).

## Yang masih perlu dilengkapi manual
- Integrasi library QR scanner di `app/absen/page.tsx` (disarankan `html5-qrcode` untuk web) — saat ini masih placeholder `prompt()`.
- Endpoint `GET /api/mahasiswa` untuk mengisi dropdown nama di halaman absensi (belum dibuat, tabel `kkn_mahasiswa` perlu diisi manual dulu via SQL atau bikin endpoint seed).
- Auth sederhana di mobile app (saat ini `mahasiswa_id` masih hardcode `1` di KeuanganScreen & LogbookScreen — ganti dengan mekanisme login/pilih user).
- Deploy `web-kkn` ke hosting (Vercel/VPS) supaya `mobile-app` bisa hit API dari luar jaringan lokal.
