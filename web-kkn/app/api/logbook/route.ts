import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const tanggalAwal = params.get("tanggal_awal");
  const tanggalAkhir = params.get("tanggal_akhir");

  let sql = `SELECT l.*, m.nama
             FROM kkn_logbook l
             JOIN kkn_mahasiswa m ON m.id = l.mahasiswa_id
             WHERE 1=1`;
  const args: any[] = [];

  if (tanggalAwal) {
    sql += " AND l.tanggal >= ?";
    args.push(tanggalAwal);
  }
  if (tanggalAkhir) {
    sql += " AND l.tanggal <= ?";
    args.push(tanggalAkhir);
  }
  sql += " ORDER BY l.tanggal DESC, l.id DESC";

  const data = await query<any[]>(sql, args);
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const { mahasiswa_id, tanggal, kegiatan, deskripsi, foto_url } =
    await req.json();

  if (!mahasiswa_id || !tanggal || !kegiatan) {
    return NextResponse.json(
      { success: false, message: "mahasiswa_id, tanggal, dan kegiatan wajib diisi" },
      { status: 400 }
    );
  }

  const result = await query<any>(
    "INSERT INTO kkn_logbook (mahasiswa_id, tanggal, kegiatan, deskripsi, foto_url) VALUES (?, ?, ?, ?, ?)",
    [mahasiswa_id, tanggal, kegiatan, deskripsi || null, foto_url || null]
  );

  return NextResponse.json(
    { success: true, id: result.insertId },
    { status: 201 }
  );
}
