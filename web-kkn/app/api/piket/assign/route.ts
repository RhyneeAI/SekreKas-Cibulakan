import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getJadwalDetail } from "@/lib/piket-service";

/** Ganti assign manual untuk satu hari (jika belum absen). */
export async function POST(req: NextRequest) {
  const { jadwal_id, tanggal, mahasiswa_ids } = await req.json();

  if (
    !jadwal_id ||
    !tanggal ||
    !Array.isArray(mahasiswa_ids) ||
    mahasiswa_ids.length === 0
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "jadwal_id, tanggal, dan mahasiswa_ids wajib diisi",
      },
      { status: 400 }
    );
  }

  const jadwal = await query<{ id: number }[]>(
    "SELECT id FROM kkn_jadwal_piket WHERE id = ?",
    [jadwal_id]
  );
  if (jadwal.length === 0) {
    return NextResponse.json(
      { success: false, message: "Jadwal piket tidak ditemukan" },
      { status: 404 }
    );
  }

  const hasAbsen = await query<{ cnt: number }[]>(
    `SELECT COUNT(*)::int AS cnt
     FROM kkn_jadwal_piket_assign a
     JOIN kkn_absensi_piket ap ON ap.assign_id = a.id
     WHERE a.jadwal_id = ? AND a.tanggal = ?`,
    [jadwal_id, tanggal]
  );
  if (hasAbsen[0].cnt > 0) {
    return NextResponse.json(
      {
        success: false,
        message: "Hari ini sudah ada yang absen — assign tidak bisa diubah",
      },
      { status: 409 }
    );
  }

  await query(
    `DELETE FROM kkn_jadwal_piket_assign
     WHERE jadwal_id = ? AND tanggal = ?`,
    [jadwal_id, tanggal]
  );

  let inserted = 0;
  for (const mahasiswaId of mahasiswa_ids) {
    await query(
      `INSERT INTO kkn_jadwal_piket_assign (jadwal_id, mahasiswa_id, tanggal)
       VALUES (?, ?, ?)`,
      [jadwal_id, mahasiswaId, tanggal]
    );
    inserted++;
  }

  const detail = await getJadwalDetail(jadwal_id);

  return NextResponse.json({
    success: true,
    inserted,
    tanggal,
    jadwal: detail,
  });
}
