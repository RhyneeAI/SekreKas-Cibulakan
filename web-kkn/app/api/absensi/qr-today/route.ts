import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import crypto from "crypto";

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);

  const existing = await query<any[]>(
    "SELECT * FROM kkn_qr_token WHERE tanggal_berlaku = ? AND expired_at > NOW() LIMIT 1",
    [today]
  );

  if (existing.length > 0) {
    return NextResponse.json({
      token: existing[0].token,
      expired_at: existing[0].expired_at,
    });
  }

  const token = crypto.randomBytes(16).toString("hex");
  const expiredAt = new Date();
  expiredAt.setHours(23, 59, 59, 999);

  await query(
    "INSERT INTO kkn_qr_token (token, tanggal_berlaku, expired_at) VALUES (?, ?, ?)",
    [token, today, expiredAt]
  );

  return NextResponse.json({ token, expired_at: expiredAt.toISOString() });
}
