import { Battle, EloRating, find } from "@/lib/types/elo";
import { db } from "@/app/api/_base";

export function computeElo(
  originalRating: EloRating[],
  battle: Battle,
  K = 4,
  SCALE = 400,
  BASE = 10,
  INIT_RATING = 1000,
) {
  // Get rating of model A and model B
  const ratingA =
    find.call(originalRating, battle.modelA)?.eloRating || INIT_RATING;
  const ratingB =
    find.call(originalRating, battle.modelB)?.eloRating || INIT_RATING;

  const expectedA = 1 / (1 + Math.pow(BASE, (ratingB - ratingA) / SCALE));
  const expectedB = 1 / (1 + Math.pow(BASE, (ratingA - ratingB) / SCALE));

  let sA = 0.5;
  let sB = 0.5;
  if (battle.winner === "A") {
    sA = 1;
    sB = 0;
  } else if (battle.winner === "B") {
    sA = 0;
    sB = 1;
  }
  return [
    {
      modelName: battle.modelA,
      eloRating: ratingA + K * (sA - expectedA),
    },
    {
      modelName: battle.modelB,
      eloRating: ratingB + K * (sB - expectedB),
    },
  ];
}

export async function updateEloRating(newEloRating: EloRating[]) {
  for (const rating of newEloRating) {
    await db.eloLeaderboard.upsert({
      where: { modelName: rating.modelName },
      update: { eloRating: rating.eloRating },
      create: rating,
    });
  }
}
