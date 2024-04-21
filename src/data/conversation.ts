import { PrismaClient } from "@prisma/client";

/*
Schema

model Conversation {
  id            String               @id @default(auto()) @map("_id") @db.ObjectId
  contributor   User?                @relation(fields: [contributorId], references: [id], onDelete: NoAction, onUpdate: Cascade)
  contributorId String               @db.ObjectId
  records       ConversationRecord[]
}

model ConversationRecord {
  id                       String               @id @default(auto()) @map("_id") @db.ObjectId
  rounds                   ConversationRound[]
  conversation             Conversation?        @relation(fields: [conversationId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  conversationId           String?              @db.ObjectId
  prevConversationRecordId String?              @db.ObjectId
  prevConversationRecord   ConversationRecord?  @relation("conversationTree", fields: [prevConversationRecordId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  nextConversationRecords  ConversationRecord[] @relation("conversationTree")
  modelName                String
  rating                   Int?
}

type ConversationRound {
  prompt     String
  completion String
}

*/

export const getSiblingConversationRecord = async (
  conversationRecordId: string,
) => {
  try {
    const db = new PrismaClient();
    const conversationRecord = await db.conversationRecord.findFirst({
      where: { id: conversationRecordId },
      include: { conversation: { include: { records: true } } },
    });
    const conversation = conversationRecord?.conversation;
    const records = conversation?.records;
    const siblingRecord = records?.find(
      (record) => record.id !== conversationRecordId,
    );
    db.$disconnect();
    return siblingRecord?.id;
  } catch {
    return null;
  }
};

export const checkIfRoundExists = async (conversationRecordId: string) => {
  try {
    const db = new PrismaClient();
    const conversationRecord = await db.conversationRecord.findFirst({
      where: { id: conversationRecordId },
    });
    if (!conversationRecord) {
      return false;
    }
    if (conversationRecord.rounds && conversationRecord.rounds.length > 0) {
      db.$disconnect();
      return true;
    }
    db.$disconnect();
    return false;
  } catch {
    return false;
  }
};

export const getModelByConversationRecordId = async (conversationRecordId: string) => {
  try {
    const db = new PrismaClient();
    const conversationRecord = await db.conversationRecord.findFirst({
      where: { id: conversationRecordId },
    });
    db.$disconnect();
    return conversationRecord?.modelName;
  } catch {
    return null;
  }
}

export const editRatingByConversationRecordId = async (
  conversationRecordId: string,
  rating: number,
) => {
  try {
    const db = new PrismaClient();
    await db.conversationRecord.update({
      where: { id: conversationRecordId },
      data: { rating },
    });
    db.$disconnect();
  } catch {
    return null;
  }
}