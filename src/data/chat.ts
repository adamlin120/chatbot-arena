import { db } from "@/app/api/_base";
import { RateEditing } from "@/prisma/client";

function selectNumbers(m: number, n: number): number[] | null {
  if (m > n) {
    console.error("Error: selected number should be less or equal than database size.");
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

export const getRandomChats = async (count: number, userId?: string) => {
    const conversationCount = await db.conversationRecord.count();
    if (conversationCount === 0) {
      return [];
    }
    if (count > conversationCount || count == -1) {
      count = conversationCount
    }
    var result: any[] = [];
    const selected_index = selectNumbers(count, conversationCount)
    if (selected_index == null){
      throw new Error(
        "Count is bigger than the number of products in the database",
      );
    }
    for (var i = 0; i < count; i++) {
        const pickedConversation = await db.conversationRecord.findFirst({
          skip: selected_index[i],
          select: {
            id: true,
            conversationId: true,
            modelName: true,
            rounds: true,
          },
        });
        result.push(pickedConversation);
      }
      return result;
}