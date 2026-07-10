import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getRouletteBoostList } from "@/lib/piket-service";
import { estimateGroupPickChance } from "@/lib/piket-chance";

export async function GET(req: NextRequest) {
  const poolSize = Number(req.nextUrl.searchParams.get("pool") || "0");
  const groups = await getRouletteBoostList();

  const withChance = groups.map((g) => {
    const memberCount = g.members?.length ?? 0;
    const chance =
      poolSize > 0
        ? estimateGroupPickChance(memberCount, poolSize, g.boost_percent)
        : null;
    return { ...g, chance };
  });

  return NextResponse.json({ data: withChance });
}
