import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const detail = req.nextUrl.searchParams.get("detail") === "1";
  const pengurus = req.nextUrl.searchParams.get("pengurus") === "1";

  if (pengurus) {
    const data = await query(
      `SELECT id, nama
       FROM kkn_mahasiswa
       WHERE jabatan IS NOT NULL AND jabatan != 'Anggota'
       ORDER BY
         CASE jabatan
           WHEN 'Ketua Umum' THEN 1
           WHEN 'Wakil Ketua' THEN 2
           WHEN 'Sekretaris' THEN 3
           WHEN 'Bendahara' THEN 4
           ELSE 5
         END,
         nama ASC`
    );
    return NextResponse.json({ data });
  }

  const data = detail
    ? await query(
        `SELECT m.id, m.nama, m.nim, m.jabatan,
                p.nama AS prodi, f.nama AS fakultas
         FROM kkn_mahasiswa m
         LEFT JOIN kkn_prodi p ON p.id = m.prodi_id
         LEFT JOIN kkn_fakultas f ON f.id = p.fakultas_id
         ORDER BY m.nama ASC`
      )
    : await query("SELECT id, nama FROM kkn_mahasiswa ORDER BY nama ASC");

  return NextResponse.json({ data });
}
