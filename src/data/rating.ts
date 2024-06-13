import { db } from "@/app/api/_base";
import { RateEditing } from "@/prisma/client";

function selectNumbers(m: number, n: number): number[] | null {
  if (m > n) {
    console.error(
      "Error: selected number should be less or equal than database size.",
    );
    return null;
  }

  let numbers: number[] = [];
  for (let i = 0; i < n; i++) {
    numbers.push(i);
  }

  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  const selectedNumbers = numbers.slice(0, m);

  return selectedNumbers;
}

const userInScore = (score: RateEditing["scores"], userId: string) => {
  return score.some((s) => s.raterId === userId);
};

export const getRandomRatings = async (count: number, userId?: string) => {
  if (count == 1) {
    const rateEditingCount = await db.rateEditing.count();
    if (rateEditingCount === 0) {
      return [];
    }
    if (count > rateEditingCount) {
      throw new Error(
        "Count is bigger than the number of products in the database",
      );
    }
    var result: any[] = [];
    var trials = 0;
    for (var i = 0; i < count; i++) {
      trials++;
      const skip = Math.floor(Math.random() * rateEditingCount);
      const pickedRating = await db.rateEditing.findFirst({
        skip: skip + i,
        select: {
          id: true,
          originalPrompt: true,
          originalCompletion: true,
          editedPrompt: true,
          editedCompletion: true,
          contributorId: true,
          scores: true,
          contributor: {
            select: {
              username: true,
              avatarUrl: true,
            },
          },
        },
      });
      if (
        !pickedRating ||
        result.includes(pickedRating) ||
        (userId && userInScore(pickedRating.scores, userId))
      ) {
        if (trials > rateEditingCount || trials > Math.max(count * 2, 10)) {
          break;
        }
        i--;
        continue;
      }
      result.push(pickedRating);
    }
    return result;
  } else {
    const rateEditingCount = await db.rateEditing.count();
    if (rateEditingCount === 0) {
      return [];
    }
    if (count > rateEditingCount || count == -1) {
      count = rateEditingCount;
    }
    var result: any[] = [];
    const selected_index = selectNumbers(count, rateEditingCount);
    if (selected_index == null) {
      throw new Error(
        "Count is bigger than the number of products in the database",
      );
    }
    for (var i = 0; i < count; i++) {
      const pickedRating = await db.rateEditing.findFirst({
        skip: selected_index[i],
        select: {
          id: true,
          model: true,
          originalPrompt: true,
          originalCompletion: true,
          editedPrompt: true,
          editedCompletion: true,
          contributorId: true,
          scores: true,
          contributor: {
            select: {
              username: true,
              avatarUrl: true,
            },
          },
        },
      });
      result.push(pickedRating);
    }
    return result;
  }
};

export const updateRating = async (
  userId: string,
  promptEditedScore: number,
  completionEditedScore: number,
  rateEditingID: string,
  feedback: string | undefined = undefined,
) => {
  // Fetch existing ratings
  const existingRating = await db.rateEditing.findUnique({
    where: {
      id: rateEditingID,
    },
    select: {
      totalPromptEditedScore: true,
      totalCompletionEditedScore: true,
      scores: true,
    },
  });

  if (!existingRating) {
    return null;
  }

  const scoreLength = existingRating.scores.length;

  // Calculate updated totals
  const updatedPromptEditedScore =
    (existingRating.totalPromptEditedScore * scoreLength + promptEditedScore) /
    (scoreLength + 1);
  const updatedCompletionEditedScore =
    (existingRating.totalCompletionEditedScore * scoreLength +
      completionEditedScore) /
    (scoreLength + 1);

  // Update the database
  if (feedback) {
    await db.rateEditing.update({
      where: {
        id: rateEditingID,
      },
      data: {
        totalPromptEditedScore: updatedPromptEditedScore,
        totalCompletionEditedScore: updatedCompletionEditedScore,
        scores: {
          push: {
            promptEditedScore: promptEditedScore,
            completionEditedScore: completionEditedScore,
            feedback: feedback,
            raterId: userId,
          },
        },
      },
    });
  } else {
    await db.rateEditing.update({
      where: {
        id: rateEditingID,
      },
      data: {
        totalPromptEditedScore: updatedPromptEditedScore,
        totalCompletionEditedScore: updatedCompletionEditedScore,
        scores: {
          push: {
            promptEditedScore: promptEditedScore,
            completionEditedScore: completionEditedScore,
            raterId: userId,
          },
        },
      },
    });
  }
};
