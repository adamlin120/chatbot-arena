import { PrismaClient } from "@/prisma/client";

export async function getLeaderboard() {
  "use server";
  try {
    const db = new PrismaClient();
    const leaderboard = await db.eloLeaderboard.findMany({
      orderBy: {
        eloRating: "desc",
      },
      select: {
        modelName: true,
        eloRating: true,
      },
    });
    return leaderboard;
  } catch (error) {
    console.error("Error in getLeaderboard", error);
    return null;
  }
}
