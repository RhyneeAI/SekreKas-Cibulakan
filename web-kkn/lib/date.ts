const TZ = "Asia/Jakarta";

/** Tanggal hari ini format YYYY-MM-DD (WIB). */
export function todayJakarta(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

/** Akhir hari WIB sebagai ISO string untuk Postgres timestamptz. */
export function endOfDayJakarta(): string {
  return `${todayJakarta()}T23:59:59+07:00`;
}

/** Format tanggal panjang untuk tampilan UI. */
export function formatDateJakarta(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Tambah hari ke tanggal YYYY-MM-DD. */
export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

/** 7 tanggal berturut-turut dari tanggal mulai (1 minggu). */
export function weekDatesFromStart(tanggalMulai: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(tanggalMulai, i));
}

/** Senin pada minggu yang sama dengan tanggal referensi (WIB). */
export function mondayOfWeek(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const dow = dt.getDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  return addDays(dateStr, offset);
}
