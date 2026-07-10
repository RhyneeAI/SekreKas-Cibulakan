import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const tanggalAwal = params.get("tanggal_awal");
  const tanggalAkhir = params.get("tanggal_akhir");
  const kategori = params.get("kategori");

  let sql = `SELECT k.*, m.nama AS input_oleh
             FROM kkn_keuangan k
             JOIN kkn_mahasiswa m ON m.id = k.mahasiswa_id_input
             WHERE 1=1`;
  const args: any[] = [];

  if (tanggalAwal) {
    sql += " AND k.tanggal >= ?";
    args.push(tanggalAwal);
  }
  if (tanggalAkhir) {
    sql += " AND k.tanggal <= ?";
    args.push(tanggalAkhir);
  }
  if (kategori) {
    sql += " AND k.kategori = ?";
    args.push(kategori);
  }
  sql += " ORDER BY k.tanggal DESC, k.id DESC";

  const data = await query<any[]>(sql, args);

  const totalsRow = await query<any[]>(
    `SELECT
       SUM(CASE WHEN jenis = 'masuk' THEN nominal ELSE 0 END) AS total_masuk,
       SUM(CASE WHEN jenis = 'keluar' THEN nominal ELSE 0 END) AS total_keluar
     FROM kkn_keuangan`
  );
  const totalMasuk = Number(totalsRow[0]?.total_masuk || 0);
  const totalKeluar = Number(totalsRow[0]?.total_keluar || 0);

  return NextResponse.json({
    saldo_berjalan: totalMasuk - totalKeluar,
    total_masuk: totalMasuk,
    total_keluar: totalKeluar,
    data,
  });
}

export async function POST(req: NextRequest) {
  const { mahasiswa_id_input, tanggal, jenis, nominal, kategori, keterangan } =
    await req.json();

  if (!mahasiswa_id_input || !tanggal || !jenis || !nominal) {
    return NextResponse.json(
      { success: false, message: "Field wajib belum lengkap" },
      { status: 400 }
    );
  }
  if (jenis !== "masuk" && jenis !== "keluar") {
    return NextResponse.json(
      { success: false, message: "jenis harus 'masuk' atau 'keluar'" },
      { status: 400 }
    );
  }

  const result = await query<{ id: number }>(
    "INSERT INTO kkn_keuangan (mahasiswa_id_input, tanggal, jenis, nominal, kategori, keterangan) VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
    [mahasiswa_id_input, tanggal, jenis, nominal, kategori || null, keterangan || null]
  );

  return NextResponse.json(
    { success: true, id: result[0]?.id },
    { status: 201 }
  );
}
