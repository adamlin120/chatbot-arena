import { db } from "@/app/api/_base";
import { error } from "console";
import {
  Message,
  ConversationRound,
  conversationRoundDBOutputType,
} from "@/lib/types/db";

export const getSiblingConversationRecord = async (
  conversationRecordId: string,
) => {
  try {
    const conversationRecord = await db.conversationRecord.findFirst({
      where: { id: conversationRecordId },
      include: { conversation: { include: { records: true } } },
    });
    const conversation = conversationRecord?.conversation;
    const records = conversation?.records;
    const siblingRecord = records?.find(
      (record) => record.id !== conversationRecordId,
    );

    return siblingRecord?.id;
  } catch {
    return null;
  }
};

export const checkIfRoundExists = async (conversationRecordId: string) => {
  try {
    const conversationRecord = await db.conversationRecord.findFirst({
      where: { id: conversationRecordId },
    });
    if (!conversationRecord) {
      return false;
    }
    if (conversationRecord.rounds && conversationRecord.rounds.length > 0) {
      return true;
    }
    return false;
  } catch {
    error("Error in checkIfRoundExists");
    return false;
  }
};

export const getModelByConversationRecordId = async (
  conversationRecordId: string,
) => {
  try {
    const conversationRecord = await db.conversationRecord.findFirst({
      where: { id: conversationRecordId },
    });

    return conversationRecord?.modelName;
  } catch {
    return null;
  }
};

export const editRatingByConversationRecordId = async (
  conversationRecordId: string,
  rating: number,
) => {
  try {
    await db.conversationRecord.update({
      where: { id: conversationRecordId },
      data: { rating },
    });
  } catch {
    return null;
  }
};

export const findForkIndexOfTwoRounds = async (
  messagesA: ConversationRound[],
  messagesB: ConversationRound[],
) => {
  let index = 0;
  while (
    index < messagesA.length &&
    index < messagesB.length &&
    messagesA[index].prompt === messagesB[index].prompt &&
    messagesA[index].completion === messagesB[index].completion
  ) {
    index++;
  }
  const minOfLength = Math.min(messagesA.length, messagesB.length);
  if (index === minOfLength) {
    return -1;
  }
  return index;
};

export const messagesToConversationRound = (message: Message[]) => {
  let rounds: ConversationRound[] = [];
  if (message[0].role != "user") {
    rounds.push({ prompt: "", completion: message[0].content });
    message.shift();
  }
  for (let i = 0; i < message.length - 1; i += 2) {
    if (message[i].role == "user" && message[i + 1].role == "assistant") {
      rounds.push({
        prompt: message[i].content,
        completion: message[i + 1].content,
      });
    } else {
      return null;
    }
  }
  return rounds;
};

export const conversationRoundDBOutputTypeToConversationRound = (
  conversationRoundDBOutput: conversationRoundDBOutputType,
): ConversationRound => {
  let conversationRound = {
    prompt: conversationRoundDBOutput.prompt,
    completion: conversationRoundDBOutput.completion,
    modifiedConversationRecordId:
      conversationRoundDBOutput.modifiedConversationRecordId
        ? conversationRoundDBOutput.modifiedConversationRecordId
        : undefined,
    originalConversationRecordId:
      conversationRoundDBOutput.originalConversationRecordId
        ? conversationRoundDBOutput.originalConversationRecordId
        : undefined,
  };
  return conversationRound;
};
