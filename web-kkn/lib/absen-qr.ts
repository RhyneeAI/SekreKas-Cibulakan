import crypto from "crypto";
import { query } from "@/lib/db";

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/** Token QR permanen — env override, atau satu baris di DB (generate sekali). */
export async function getAbsenQrToken(): Promise<string> {
  const fromEnv = process.env.ABSEN_QR_SECRET?.trim();
  if (fromEnv) return fromEnv;

  const rows = await query<{ token: string }[]>(
    "SELECT token FROM kkn_qr_token WHERE tanggal_berlaku IS NULL LIMIT 1"
  );
  if (rows.length > 0) return rows[0].token;

  const token = crypto.randomBytes(16).toString("hex");
  await query(
    "INSERT INTO kkn_qr_token (token, tanggal_berlaku, expired_at) VALUES (?, NULL, NULL)",
    [token]
  );
  return token;
}

export async function isValidAbsenQrToken(token: string): Promise<boolean> {
  if (!token) return false;
  const expected = await getAbsenQrToken();
  return safeEqual(token, expected);
}
