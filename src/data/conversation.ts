import { PrismaClient } from "@prisma/client";

export const getSiblingConversationRecord = async (conversationRecordId: string) => {
    try {
        const db = new PrismaClient();
        const conversationRecord = await db.conversationRecord.findFirst({
        where: { id: conversationRecordId },
        include: { conversation: { include: { records: true } } },
        });
        const conversation = conversationRecord?.conversation;
        const records = conversation?.records;
        const siblingRecord = records?.find((record) => record.id !== conversationRecordId);
        db.$disconnect();
        return siblingRecord?.id;
    } catch {
        return null;
    }
}

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
}

export const editLastRoundRating = async (conversationRecordId: string, rating: number) => {
    const db = new PrismaClient();
    const conversationRecord = await db.conversationRecord.findFirst({
        where: { id: conversationRecordId },
    });
    if (!conversationRecord) {
        return;
    }
    const lastRound = conversationRecord.rounds[conversationRecord.rounds.length - 1];
    if (!lastRound.rating) {
        lastRound.rating = rating;
        await db.conversationRecord.update({
            where: { id: conversationRecordId },
            data: { rounds: { set: conversationRecord.rounds } },
        });
        
    db.$disconnect();
    return;
    }
}
