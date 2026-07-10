import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const detail = req.nextUrl.searchParams.get("detail") === "1";

  const data = detail
    ? await query(
        "SELECT id, nama, nim, jabatan, fakultas_prodi FROM kkn_mahasiswa ORDER BY nama ASC"
      )
    : await query(
        "SELECT id, nama FROM kkn_mahasiswa ORDER BY nama ASC"
      );

  return NextResponse.json({ data });
}
