import { db } from "@/app/api/_base";
import { RateEditing } from "@/prisma/client";

export const getRandomRatings = async (count: number) => {
  const productsCount = await db.rateEditing.count();
  if (productsCount === 0) {
    return [];
  }
  if (count > productsCount) {
    throw new Error(
      "Count is bigger than the number of products in the database",
    );
  }
  var result: any[] = [];
  for (var i = 0; i < count; i++) {
    const skip = Math.floor(Math.random() * productsCount);
    const pickedRating = await db.rateEditing.findFirst({
      skip: skip + i,
      select: {
        id: true,
        originalPrompt: true,
        originalCompletion: true,
        editedPrompt: true,
        editedCompletion: true,
        contributorId: true,
        contributor: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
      }
      }
    );
    if (!pickedRating || result.includes(pickedRating)) {
      i--;
      continue;
    }
    result.push(pickedRating);
  }
  return result;
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

  if (!existingRating){
    return null;
  }

  const scoreLength = existingRating.scores.length;

  // Calculate updated totals
  const updatedPromptEditedScore = (existingRating.totalPromptEditedScore * scoreLength + promptEditedScore) / (scoreLength + 1);
  const updatedCompletionEditedScore = (existingRating.totalCompletionEditedScore * scoreLength + completionEditedScore) / (scoreLength + 1);

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
