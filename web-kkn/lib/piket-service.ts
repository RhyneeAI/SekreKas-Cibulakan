import { query } from "@/lib/db";
import { addDays, weekDatesFromStart } from "@/lib/date";
import {
  DayAssignment,
  RouletteWeights,
  groupBoostToMemberWeight,
  rouletteAssignWeek,
} from "@/lib/piket-roulette";

export async function getPiketHistoryCounts(): Promise<Record<number, number>> {
  const rows = await query<{ mahasiswa_id: number; cnt: number }[]>(
    `SELECT mahasiswa_id, COUNT(*)::int AS cnt
     FROM kkn_jadwal_piket_assign
     GROUP BY mahasiswa_id`
  );
  const counts: Record<number, number> = {};
  for (const row of rows) {
    counts[row.mahasiswa_id] = row.cnt;
  }
  return counts;
}

export async function getAllMahasiswaIds(): Promise<number[]> {
  const rows = await query<{ id: number }[]>(
    "SELECT id FROM kkn_mahasiswa WHERE roulette_eligible = true ORDER BY id ASC"
  );
  return rows.map((r) => r.id);
}

export async function getRouletteEligibleMahasiswa() {
  return query<
    { id: number; nama: string; nim: string; jabatan: string | null; boost_group: string | null }[]
  >(
    `SELECT m.id, m.nama, m.nim, m.jabatan, g.nama AS boost_group
     FROM kkn_mahasiswa m
     LEFT JOIN kkn_piket_roulette_boost_member gm ON gm.mahasiswa_id = m.id
     LEFT JOIN kkn_piket_roulette_boost_group g ON g.id = gm.group_id
     WHERE m.roulette_eligible = true
     ORDER BY m.nama ASC`
  );
}

export async function insertDayAssignments(
  jadwalId: number,
  days: DayAssignment[]
): Promise<number> {
  let inserted = 0;
  for (const day of days) {
    for (const mahasiswaId of day.mahasiswa_ids) {
      await query(
        `INSERT INTO kkn_jadwal_piket_assign (jadwal_id, mahasiswa_id, tanggal)
         VALUES (?, ?, ?)`,
        [jadwalId, mahasiswaId, day.tanggal]
      );
      inserted++;
    }
  }
  return inserted;
}

export async function getRouletteWeights(
  memberIds: number[]
): Promise<RouletteWeights> {
  if (memberIds.length === 0) return {};

  const placeholders = memberIds.map(() => "?").join(", ");
  const rows = await query<
    { mahasiswa_id: number; boost_percent: number; member_count: number }[]
  >(
    `SELECT gm.mahasiswa_id,
            g.boost_percent::float AS boost_percent,
            COUNT(*) OVER (PARTITION BY g.id)::int AS member_count
     FROM kkn_piket_roulette_boost_group g
     JOIN kkn_piket_roulette_boost_member gm ON gm.group_id = g.id
     WHERE gm.mahasiswa_id IN (${placeholders})`,
    memberIds
  );

  const weights: RouletteWeights = {};
  for (const id of memberIds) {
    weights[id] = 1;
  }
  for (const row of rows) {
    weights[row.mahasiswa_id] = groupBoostToMemberWeight(
      row.boost_percent,
      row.member_count
    );
  }
  return weights;
}

export async function getRouletteBoostList() {
  return query<
    {
      id: number;
      nama: string;
      boost_percent: number;
      members: { mahasiswa_id: number; nama: string }[];
    }[]
  >(
    `SELECT g.id, g.nama, g.boost_percent::float AS boost_percent,
            COALESCE(
              json_agg(
                json_build_object('mahasiswa_id', m.id, 'nama', m.nama)
                ORDER BY m.nama
              ) FILTER (WHERE m.id IS NOT NULL),
              '[]'
            ) AS members
     FROM kkn_piket_roulette_boost_group g
     LEFT JOIN kkn_piket_roulette_boost_member gm ON gm.group_id = g.id
     LEFT JOIN kkn_mahasiswa m ON m.id = gm.mahasiswa_id
     GROUP BY g.id
     ORDER BY g.nama ASC`
  );
}

export async function generateWeekAssignments(
  memberIds: number[],
  tanggalMulai: string,
  orangPerHari: number
): Promise<DayAssignment[]> {
  const dates = weekDatesFromStart(tanggalMulai);
  const history = await getPiketHistoryCounts();
  const weights = await getRouletteWeights(memberIds);
  return rouletteAssignWeek(memberIds, dates, orangPerHari, history, weights);
}

export function weekEndFromStart(tanggalMulai: string): string {
  return addDays(tanggalMulai, 6);
}

export async function getJadwalDetail(jadwalId: number) {
  const jadwalRows = await query<
    {
      id: number;
      nama: string;
      deskripsi: string | null;
      tanggal_mulai: string;
      tanggal_selesai: string;
      orang_per_hari: number;
    }[]
  >(
    `SELECT id, nama, deskripsi, tanggal_mulai, tanggal_selesai, orang_per_hari
     FROM kkn_jadwal_piket WHERE id = ?`,
    [jadwalId]
  );
  if (jadwalRows.length === 0) return null;

  const assignRows = await query<
    {
      tanggal: string;
      mahasiswa_id: number;
      nama: string;
      assign_id: number;
      sudah_absen: boolean;
    }[]
  >(
    `SELECT a.tanggal, a.id AS assign_id, m.id AS mahasiswa_id, m.nama,
            (ap.id IS NOT NULL) AS sudah_absen
     FROM kkn_jadwal_piket_assign a
     JOIN kkn_mahasiswa m ON m.id = a.mahasiswa_id
     LEFT JOIN kkn_absensi_piket ap ON ap.assign_id = a.id
     WHERE a.jadwal_id = ?
     ORDER BY a.tanggal ASC, m.nama ASC`,
    [jadwalId]
  );

  const byDate = new Map<
    string,
    { mahasiswa_id: number; nama: string; assign_id: number; sudah_absen: boolean }[]
  >();

  for (const row of assignRows) {
    const list = byDate.get(row.tanggal) ?? [];
    list.push({
      mahasiswa_id: row.mahasiswa_id,
      nama: row.nama,
      assign_id: row.assign_id,
      sudah_absen: row.sudah_absen,
    });
    byDate.set(row.tanggal, list);
  }

  const jadwal = jadwalRows[0];
  const dates = weekDatesFromStart(jadwal.tanggal_mulai);
  const hari = dates.map((tanggal) => ({
    tanggal,
    anggota: byDate.get(tanggal) ?? [],
  }));

  return { ...jadwal, hari };
}

export async function deleteAssignmentsForDates(
  jadwalId: number,
  dates: string[]
): Promise<void> {
  if (dates.length === 0) return;
  const placeholders = dates.map(() => "?").join(", ");
  await query(
    `DELETE FROM kkn_jadwal_piket_assign a
     WHERE a.jadwal_id = ?
       AND a.tanggal IN (${placeholders})
       AND NOT EXISTS (
         SELECT 1 FROM kkn_absensi_piket ap WHERE ap.assign_id = a.id
       )`,
    [jadwalId, ...dates]
  );
}

export async function getDatesWithAbsensi(jadwalId: number): Promise<Set<string>> {
  const rows = await query<{ tanggal: string }[]>(
    `SELECT DISTINCT a.tanggal
     FROM kkn_jadwal_piket_assign a
     JOIN kkn_absensi_piket ap ON ap.assign_id = a.id
     WHERE a.jadwal_id = ?`,
    [jadwalId]
  );
  return new Set(rows.map((r) => r.tanggal));
}
