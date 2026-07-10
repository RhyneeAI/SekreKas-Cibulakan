import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { todayJakarta } from "@/lib/date";
import { isValidAbsenQrToken } from "@/lib/absen-qr";
import { resolveMahasiswaFromUuid } from "@/lib/device-binding";

export async function POST(req: NextRequest) {
  const { uuid, qr_token, jadwal_id } = await req.json();
  const userAgent = req.headers.get("user-agent") || "";

  if (!uuid || !qr_token || !jadwal_id) {
    return NextResponse.json(
      { success: false, message: "uuid, qr_token, dan jadwal_id wajib diisi" },
      { status: 400 }
    );
  }

  if (!(await isValidAbsenQrToken(qr_token))) {
    return NextResponse.json(
      { success: false, message: "QR tidak valid" },
      { status: 400 }
    );
  }

  const binding = await resolveMahasiswaFromUuid(uuid);
  if (!binding) {
    return NextResponse.json(
      {
        success: false,
        message: "Device belum terdaftar",
        action: "redirect_to_register",
      },
      { status: 404 }
    );
  }

  const today = todayJakarta();
  const assigns = await query<{ id: number; nama: string }[]>(
    `SELECT a.id, j.nama
     FROM kkn_jadwal_piket_assign a
     JOIN kkn_jadwal_piket j ON j.id = a.jadwal_id
     WHERE a.mahasiswa_id = ? AND a.jadwal_id = ? AND a.tanggal = ?`,
    [binding.mahasiswa_id, jadwal_id, today]
  );

  if (assigns.length === 0) {
    return NextResponse.json(
      { success: false, message: "Kamu tidak dijadwalkan piket ini hari ini" },
      { status: 403 }
    );
  }

  const assign = assigns[0];

  try {
    await query(
      `INSERT INTO kkn_absensi_piket
         (assign_id, mahasiswa_id, jadwal_id, uuid, tanggal, waktu_masuk, user_agent)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIME, ?)`,
      [assign.id, binding.mahasiswa_id, jadwal_id, uuid, today, userAgent]
    );
  } catch (err: unknown) {
    const pgErr = err as { code?: string };
    if (pgErr.code === "23505") {
      return NextResponse.json(
        { success: false, message: `Sudah absen piket "${assign.nama}" hari ini` },
        { status: 409 }
      );
    }
    throw err;
  }

  await query(
    "UPDATE kkn_device_binding SET last_used_at = NOW() WHERE uuid = ?",
    [uuid]
  );

  return NextResponse.json({
    success: true,
    nama_jadwal: assign.nama,
    waktu_masuk: new Date().toISOString(),
  });
}
