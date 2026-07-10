import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { todayJakarta } from "@/lib/date";
import { resolveMahasiswaFromUuid } from "@/lib/device-binding";

export async function GET(req: NextRequest) {
  const uuid = req.nextUrl.searchParams.get("uuid");
  if (!uuid) {
    return NextResponse.json(
      { success: false, message: "uuid wajib diisi" },
      { status: 400 }
    );
  }

  const binding = await resolveMahasiswaFromUuid(uuid);
  if (!binding) {
    return NextResponse.json(
      { success: false, message: "Device belum terdaftar" },
      { status: 404 }
    );
  }

  const today = todayJakarta();
  const rows = await query<
    {
      assign_id: number;
      jadwal_id: number;
      nama_jadwal: string;
      sudah_absen: boolean;
    }[]
  >(
    `SELECT a.id AS assign_id,
            j.id AS jadwal_id,
            j.nama AS nama_jadwal,
            (ap.id IS NOT NULL) AS sudah_absen
     FROM kkn_jadwal_piket_assign a
     JOIN kkn_jadwal_piket j ON j.id = a.jadwal_id
     LEFT JOIN kkn_absensi_piket ap ON ap.assign_id = a.id
     WHERE a.mahasiswa_id = ? AND a.tanggal = ?
     ORDER BY j.nama ASC`,
    [binding.mahasiswa_id, today]
  );

  return NextResponse.json({
    tanggal: today,
    data: rows.map((r) => ({
      assign_id: r.assign_id,
      jadwal_id: r.jadwal_id,
      nama_jadwal: r.nama_jadwal,
      sudah_absen: r.sudah_absen,
    })),
  });
}
