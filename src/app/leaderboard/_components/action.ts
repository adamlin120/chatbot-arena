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
    console.log("Leaderboard fetched");
    return leaderboard;
  } catch (error) {
    console.log("Error in getLeaderboard", error);
    return null;
  }
}
