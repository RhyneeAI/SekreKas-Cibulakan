import { NextResponse } from "next/server";
import { getAbsenQrToken } from "@/lib/absen-qr";

export async function GET() {
  const token = await getAbsenQrToken();
  return NextResponse.json({ token, permanent: true });
}
