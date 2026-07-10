export type DayAssignment = {
  tanggal: string;
  mahasiswa_ids: number[];
};

export type RouletteWeights = Record<number, number>;

/** Bobot dasar 1.0; boost 12.5% untuk grup → multiplier 1.125 total grup. */
export function boostPercentToWeight(boostPercent: number): number {
  return 1 + boostPercent / 100;
}

/**
 * Boost grup dibagi rata ke anggota — total peluang grup naik `boostPercent`,
 * bukan per orang.
 * Contoh: grup 2 orang, +12.5% → tiap orang weight 1.0625 (total 2.125).
 */
export function groupBoostToMemberWeight(
  boostPercent: number,
  memberCount: number
): number {
  if (memberCount <= 0) return 1;
  return 1 + boostPercent / 100 / memberCount;
}

/**
 * Pilih satu anggota dengan weighted random.
 * Skor = bobot × fairness × random, fairness turun seiring jumlah assign.
 */
function weightedPickOne(
  pool: number[],
  counts: Record<number, number>,
  weights: RouletteWeights
): number {
  let bestId = pool[0];
  let bestScore = -1;

  for (const id of pool) {
    const weight = weights[id] ?? 1;
    const fairness = 1 / (1 + (counts[id] ?? 0));
    const score = weight * fairness * Math.random();
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  }

  return bestId;
}

/**
 * Roulette adil + bobot chance per anggota.
 * Prioritas yang jarang di-assign; boost menaikkan peluang terpilih.
 */
export function rouletteAssignWeek(
  memberIds: number[],
  dates: string[],
  orangPerHari: number,
  historyCounts: Record<number, number> = {},
  weights: RouletteWeights = {}
): DayAssignment[] {
  if (dates.length === 0) return [];
  if (memberIds.length === 0) {
    return dates.map((tanggal) => ({ tanggal, mahasiswa_ids: [] }));
  }

  const perDay = Math.max(1, orangPerHari);
  const counts: Record<number, number> = {};
  for (const id of memberIds) {
    counts[id] = historyCounts[id] ?? 0;
  }

  const resolvedWeights: RouletteWeights = {};
  for (const id of memberIds) {
    resolvedWeights[id] = weights[id] ?? 1;
  }

  return dates.map((tanggal) => {
    const available = [...memberIds];
    const picked: number[] = [];

    for (let i = 0; i < perDay && available.length > 0; i++) {
      const id = weightedPickOne(available, counts, resolvedWeights);
      picked.push(id);
      counts[id] = (counts[id] ?? 0) + 1;
      available.splice(available.indexOf(id), 1);
    }

    return { tanggal, mahasiswa_ids: picked };
  });
}

/** Fisher-Yates shuffle — untuk animasi roulette di UI. */
export function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
