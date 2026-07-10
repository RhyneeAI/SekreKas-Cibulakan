import { NextRequest, NextResponse } from "next/server";
import { getJadwalDetail } from "@/lib/piket-service";
import { query } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const jadwalId = Number(id);
  if (!jadwalId) {
    return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
  }

  const detail = await getJadwalDetail(jadwalId);
  if (!detail) {
    return NextResponse.json({ message: "Jadwal tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data: detail });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const jadwalId = Number(id);
  if (!jadwalId) {
    return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
  }

  const locked = await query<{ cnt: number }[]>(
    `SELECT COUNT(*)::int AS cnt FROM kkn_absensi_piket WHERE jadwal_id = ?`,
    [jadwalId]
  );
  if (locked[0].cnt > 0) {
    return NextResponse.json(
      {
        success: false,
        message: "Jadwal tidak bisa dihapus — sudah ada absensi piket",
      },
      { status: 409 }
    );
  }

  await query("DELETE FROM kkn_jadwal_piket WHERE id = ?", [jadwalId]);
  return NextResponse.json({ success: true });
}
