import { db } from "@/app/api/_base";
import { RateEditing } from "@/prisma/client";

export const getRandomRatings = async (count: number) => {
  const productsCount = await db.rateEditing.count();
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
