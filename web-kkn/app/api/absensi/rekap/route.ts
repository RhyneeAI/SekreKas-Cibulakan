import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { todayJakarta } from "@/lib/date";

export async function GET(req: NextRequest) {
  const tanggal = req.nextUrl.searchParams.get("tanggal") || todayJakarta();

  const data = await query<any[]>(
    `SELECT m.id AS mahasiswa_id, m.nama, a.waktu_masuk
     FROM kkn_mahasiswa m
     LEFT JOIN kkn_absensi a ON a.mahasiswa_id = m.id AND a.tanggal = ?
     ORDER BY m.nama ASC`,
    [tanggal]
  );

  const result = data.map((row) => ({
    mahasiswa_id: row.mahasiswa_id,
    nama: row.nama,
    waktu_masuk: row.waktu_masuk,
    status: row.waktu_masuk ? "hadir" : "belum_absen",
  }));

  return NextResponse.json({ tanggal, data: result });
}
