import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const data = await query<any[]>(
    "SELECT id, nama, nim FROM kkn_mahasiswa ORDER BY nama ASC"
  );
  return NextResponse.json({ data });
}
