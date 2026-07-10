import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const detail = req.nextUrl.searchParams.get("detail") === "1";
  const pengurus = req.nextUrl.searchParams.get("pengurus") === "1";
  const roulette = req.nextUrl.searchParams.get("roulette") === "1";

  if (roulette) {
    const eligible = await query<
      { id: number; nama: string; nim: string; jabatan: string | null; boost_group: string | null }[]
    >(
      `SELECT m.id, m.nama, m.nim, m.jabatan,
              g.nama AS boost_group
       FROM kkn_mahasiswa m
       LEFT JOIN kkn_piket_roulette_boost_member gm ON gm.mahasiswa_id = m.id
       LEFT JOIN kkn_piket_roulette_boost_group g ON g.id = gm.group_id
       WHERE m.roulette_eligible = true
       ORDER BY m.nama ASC`
    );

    const excluded = await query<
      { id: number; nama: string; nim: string; jabatan: string | null }[]
    >(
      `SELECT id, nama, nim, jabatan
       FROM kkn_mahasiswa
       WHERE roulette_eligible = false
       ORDER BY nama ASC`
    );

    return NextResponse.json({
      data: eligible,
      excluded,
      pool_size: eligible.length,
    });
  }

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
