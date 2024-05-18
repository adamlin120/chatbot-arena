import { NextRequest, NextResponse } from "next/server";
import { db } from "../_base";

export async function GET(req: NextRequest) {
  const leaderboard = await db.eloLeaderboard.findMany({
    orderBy: {
      eloRating: "desc",
    },
    select: {
      modelName: true,
      eloRating: true,
    },
  });
  return NextResponse.json(leaderboard);
}
