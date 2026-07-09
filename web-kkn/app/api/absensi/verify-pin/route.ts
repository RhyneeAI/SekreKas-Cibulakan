import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyPin } from "@/lib/pin";

export async function POST(req: NextRequest) {
  const { mahasiswa_id, pin, uuid } = await req.json();

  if (!mahasiswa_id || !pin || !uuid) {
    return NextResponse.json(
      { success: false, message: "mahasiswa_id, pin, dan uuid (baru) wajib diisi" },
      { status: 400 }
    );
  }

  const binding = await query<any[]>(
    "SELECT * FROM kkn_device_binding WHERE mahasiswa_id = ? ORDER BY registered_at DESC LIMIT 1",
    [mahasiswa_id]
  );

  if (binding.length === 0) {
    return NextResponse.json(
      { success: false, message: "Mahasiswa belum pernah terdaftar" },
      { status: 404 }
    );
  }

  const valid = await verifyPin(pin, binding[0].pin_hash);
  if (!valid) {
    return NextResponse.json(
      { success: false, message: "PIN salah" },
      { status: 401 }
    );
  }

  // Buat binding baru untuk device (uuid) ini, pakai pin_hash yang sama
  await query(
    "INSERT INTO kkn_device_binding (uuid, mahasiswa_id, pin_hash, registered_at) VALUES (?, ?, ?, NOW())",
    [uuid, mahasiswa_id, binding[0].pin_hash]
  );

  const mhs = await query<any[]>(
    "SELECT nama FROM kkn_mahasiswa WHERE id = ?",
    [mahasiswa_id]
  );

  return NextResponse.json({
    success: true,
    uuid,
    mahasiswa_id,
    nama: mhs[0]?.nama,
  });
}
