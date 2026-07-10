import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { mondayOfWeek, todayJakarta } from "@/lib/date";
import {
  generateWeekAssignments,
  getAllMahasiswaIds,
  getJadwalDetail,
  insertDayAssignments,
  weekEndFromStart,
} from "@/lib/piket-service";

export async function GET() {
  const rows = await query<
    {
      id: number;
      nama: string;
      deskripsi: string | null;
      tanggal_mulai: string;
      tanggal_selesai: string;
      orang_per_hari: number;
      total_assign: number;
    }[]
  >(
    `SELECT j.id, j.nama, j.deskripsi, j.tanggal_mulai, j.tanggal_selesai, j.orang_per_hari,
            COUNT(a.id)::int AS total_assign
     FROM kkn_jadwal_piket j
     LEFT JOIN kkn_jadwal_piket_assign a ON a.jadwal_id = j.id
     GROUP BY j.id
     ORDER BY j.tanggal_mulai DESC, j.nama ASC`
  );
  return NextResponse.json({ data: rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    nama,
    deskripsi,
    tanggal_mulai,
    orang_per_hari = 1,
    mahasiswa_ids,
    auto_assign = true,
    mulai_senin = true,
  } = body;

  if (!nama?.trim()) {
    return NextResponse.json(
      { success: false, message: "nama jadwal wajib diisi" },
      { status: 400 }
    );
  }

  const rawStart = tanggal_mulai ?? todayJakarta();
  const tanggalMulai = mulai_senin !== false ? mondayOfWeek(rawStart) : rawStart;
  const tanggalSelesai = weekEndFromStart(tanggalMulai);
  const perHari = Math.max(1, Math.min(10, Number(orang_per_hari) || 1));

  const poolIds: number[] =
    Array.isArray(mahasiswa_ids) && mahasiswa_ids.length > 0
      ? mahasiswa_ids.map(Number)
      : await getAllMahasiswaIds();

  if (poolIds.length === 0) {
    return NextResponse.json(
      { success: false, message: "Tidak ada anggota untuk di-assign" },
      { status: 400 }
    );
  }

  const rows = await query<{ id: number }[]>(
    `INSERT INTO kkn_jadwal_piket
       (nama, deskripsi, tanggal_mulai, tanggal_selesai, orang_per_hari)
     VALUES (?, ?, ?, ?, ?)
     RETURNING id`,
    [nama.trim(), deskripsi ?? null, tanggalMulai, tanggalSelesai, perHari]
  );
  const jadwalId = rows[0].id;

  let assignments = [];
  let totalInserted = 0;

  if (auto_assign !== false) {
    assignments = await generateWeekAssignments(poolIds, tanggalMulai, perHari);
    totalInserted = await insertDayAssignments(jadwalId, assignments);
  }

  const detail = await getJadwalDetail(jadwalId);

  return NextResponse.json(
    {
      success: true,
      id: jadwalId,
      nama: nama.trim(),
      tanggal_mulai: tanggalMulai,
      tanggal_selesai: tanggalSelesai,
      orang_per_hari: perHari,
      total_assign: totalInserted,
      roulette: auto_assign !== false,
      jadwal: detail,
    },
    { status: 201 }
  );
}
