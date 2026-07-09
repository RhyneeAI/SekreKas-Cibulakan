import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashPin } from "@/lib/pin";

export async function POST(req: NextRequest) {
  const { uuid, mahasiswa_id, pin } = await req.json();

  if (!uuid || !mahasiswa_id || !pin) {
    return NextResponse.json(
      { success: false, message: "uuid, mahasiswa_id, dan pin wajib diisi" },
      { status: 400 }
    );
  }

  // Cek apakah uuid atau mahasiswa sudah punya binding aktif
  const existing = await query<any[]>(
    "SELECT id FROM kkn_device_binding WHERE uuid = ? OR mahasiswa_id = ?",
    [uuid, mahasiswa_id]
  );
  if (existing.length > 0) {
    return NextResponse.json(
      { success: false, message: "Device atau mahasiswa sudah terdaftar" },
      { status: 409 }
    );
  }

  const pinHash = await hashPin(pin);
  await query(
    "INSERT INTO kkn_device_binding (uuid, mahasiswa_id, pin_hash, registered_at) VALUES (?, ?, ?, NOW())",
    [uuid, mahasiswa_id, pinHash]
  );

  const mhs = await query<any[]>(
    "SELECT nama FROM kkn_mahasiswa WHERE id = ?",
    [mahasiswa_id]
  );

  return NextResponse.json(
    { success: true, uuid, mahasiswa_id, nama: mhs[0]?.nama },
    { status: 201 }
  );
}
