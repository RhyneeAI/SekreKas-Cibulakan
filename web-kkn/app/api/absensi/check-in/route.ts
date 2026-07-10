import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { uuid, qr_token } = await req.json();
  const userAgent = req.headers.get("user-agent") || "";

  if (!uuid || !qr_token) {
    return NextResponse.json(
      { success: false, message: "uuid dan qr_token wajib diisi" },
      { status: 400 }
    );
  }

  // Validasi qr_token
  const tokenRows = await query<any[]>(
    "SELECT * FROM kkn_qr_token WHERE token = ? AND expired_at > NOW()",
    [qr_token]
  );
  if (tokenRows.length === 0) {
    return NextResponse.json(
      { success: false, message: "QR tidak valid atau sudah kedaluwarsa" },
      { status: 400 }
    );
  }

  // Resolve mahasiswa dari uuid
  const binding = await query<any[]>(
    "SELECT mahasiswa_id FROM kkn_device_binding WHERE uuid = ?",
    [uuid]
  );
  if (binding.length === 0) {
    return NextResponse.json(
      {
        success: false,
        message: "Device belum terdaftar",
        action: "redirect_to_register",
      },
      { status: 404 }
    );
  }
  const mahasiswaId = binding[0].mahasiswa_id;

  const today = new Date().toISOString().slice(0, 10);

  try {
    await query(
      "INSERT INTO kkn_absensi (mahasiswa_id, uuid, tanggal, waktu_masuk, user_agent) VALUES (?, ?, ?, CURRENT_TIME, ?)",
      [mahasiswaId, uuid, today, userAgent]
    );
  } catch (err: any) {
    if (err.code === "23505") {
      return NextResponse.json(
        { success: false, message: "Sudah absen hari ini" },
        { status: 409 }
      );
    }
    throw err;
  }

  await query("UPDATE kkn_device_binding SET last_used_at = NOW() WHERE uuid = ?", [uuid]);

  return NextResponse.json({
    success: true,
    waktu_masuk: new Date().toISOString(),
  });
}
