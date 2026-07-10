import { query } from "@/lib/db";

export async function resolveMahasiswaFromUuid(uuid: string) {
  const binding = await query<{ mahasiswa_id: number; nama: string }[]>(
    `SELECT b.mahasiswa_id, m.nama
     FROM kkn_device_binding b
     JOIN kkn_mahasiswa m ON m.id = b.mahasiswa_id
     WHERE b.uuid = ?`,
    [uuid]
  );
  return binding[0] ?? null;
}
