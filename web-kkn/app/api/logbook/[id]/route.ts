import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

const EDITABLE_FIELDS = ["tanggal", "kegiatan", "deskripsi", "foto_url"];

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const updates = Object.keys(body).filter((k) => EDITABLE_FIELDS.includes(k));

  if (updates.length === 0) {
    return NextResponse.json(
      { success: false, message: "Tidak ada field valid untuk diupdate" },
      { status: 400 }
    );
  }

  const setClause = updates.map((f) => `${f} = ?`).join(", ");
  const values = updates.map((f) => body[f]);
  values.push(params.id);

  await query(`UPDATE kkn_logbook SET ${setClause} WHERE id = ?`, values);

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await query("DELETE FROM kkn_logbook WHERE id = ?", [params.id]);
  return NextResponse.json({ success: true });
}
