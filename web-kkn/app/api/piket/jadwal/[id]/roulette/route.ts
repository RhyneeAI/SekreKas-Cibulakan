import { NextRequest, NextResponse } from "next/server";
import {
  deleteAssignmentsForDates,
  generateWeekAssignments,
  getAllMahasiswaIds,
  getDatesWithAbsensi,
  getJadwalDetail,
  insertDayAssignments,
  weekDatesFromStart,
} from "@/lib/piket-service";
import { query } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

/** Putar ulang roulette untuk hari yang belum ada absensi. */
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const jadwalId = Number(id);
  if (!jadwalId) {
    return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
  }

  const jadwalRows = await query<
    { tanggal_mulai: string; orang_per_hari: number }[]
  >(
    "SELECT tanggal_mulai, orang_per_hari FROM kkn_jadwal_piket WHERE id = ?",
    [jadwalId]
  );
  if (jadwalRows.length === 0) {
    return NextResponse.json({ message: "Jadwal tidak ditemukan" }, { status: 404 });
  }

  const jadwal = jadwalRows[0];
  const body = await req.json().catch(() => ({}));
  const poolIds: number[] =
    Array.isArray(body.mahasiswa_ids) && body.mahasiswa_ids.length > 0
      ? body.mahasiswa_ids.map(Number)
      : await getAllMahasiswaIds();

  const allDates = weekDatesFromStart(jadwal.tanggal_mulai);
  const lockedDates = await getDatesWithAbsensi(jadwalId);
  const rerollDates = allDates.filter((d) => !lockedDates.has(d));

  if (rerollDates.length === 0) {
    return NextResponse.json(
      {
        success: false,
        message: "Semua hari sudah ada absensi — tidak bisa di-roulette ulang",
      },
      { status: 409 }
    );
  }

  await deleteAssignmentsForDates(jadwalId, rerollDates);

  const fullWeek = await generateWeekAssignments(
    poolIds,
    jadwal.tanggal_mulai,
    jadwal.orang_per_hari
  );
  const toInsert = fullWeek.filter((d) => rerollDates.includes(d.tanggal));
  const inserted = await insertDayAssignments(jadwalId, toInsert);

  const detail = await getJadwalDetail(jadwalId);

  return NextResponse.json({
    success: true,
    rerolled_days: rerollDates.length,
    total_assign: inserted,
    skipped_days: lockedDates.size,
    jadwal: detail,
  });
}
