import { db } from "@/app/api/_base";
import { RateEditing } from "@/prisma/client";
import { UserRoundIcon } from "lucide-react";

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
  var result: RateEditing[] = [];
  for (var i = 0; i < count; i++) {
    const skip = Math.floor(Math.random() * productsCount);
    const pickedRating = await db.rateEditing.findFirst({
      skip: skip + i,
    });
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
  if (feedback) {
    await db.rateEditing.update({
      where: {
        id: rateEditingID,
      },
      data: {
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
