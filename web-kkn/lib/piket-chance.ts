/** Estimasi peluang grup terpilih per slot roulette (approx). */
export function estimateGroupPickChance(
  groupSize: number,
  poolSize: number,
  boostPercent: number
): { baselinePct: number; boostedPct: number; deltaPct: number } {
  if (poolSize <= 0 || groupSize <= 0) {
    return { baselinePct: 0, boostedPct: 0, deltaPct: 0 };
  }
  const baselinePct = (groupSize / poolSize) * 100;
  const boostedPct = baselinePct * (1 + boostPercent / 100);
  return {
    baselinePct: Math.round(baselinePct * 10) / 10,
    boostedPct: Math.round(boostedPct * 10) / 10,
    deltaPct: Math.round((boostedPct - baselinePct) * 10) / 10,
  };
}
