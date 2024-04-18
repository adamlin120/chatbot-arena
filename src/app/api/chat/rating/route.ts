import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";
import {
  getSiblingConversationRecord,
  editLastRoundRating,
  checkIfRoundExists,
} from "@/data/conversation";

export async function POST(request: NextRequest) {
  const db = new PrismaClient();
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationRecordId, rating } = await request.json();

  if (rating < 0 || rating > 2) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  const siblingRecordId =
    await getSiblingConversationRecord(conversationRecordId);

  if (!siblingRecordId) {
    return NextResponse.json(
      { error: "Conversation record not found" },
      { status: 404 },
    );
  }

  if (!(await checkIfRoundExists(conversationRecordId))) {
    return NextResponse.json({ error: "No rounds found" }, { status: 404 });
  }
  if (!(await checkIfRoundExists(siblingRecordId))) {
    return NextResponse.json({ error: "No rounds found" }, { status: 404 });
  }

  var conversationRoundRating = 0;
  var siblingConversationRoundRating = 0;

  switch (rating) {
    case 0:
      conversationRoundRating = -2;
      siblingConversationRoundRating = -2;
      break;
    case 1:
      conversationRoundRating = 1;
      siblingConversationRoundRating = -1;
      break;
    case 2:
      conversationRoundRating = 0;
      siblingConversationRoundRating = 0;
      break;
  }

  await editLastRoundRating(conversationRecordId, conversationRoundRating);
  await editLastRoundRating(siblingRecordId, siblingConversationRoundRating);
  db.$disconnect();
  return NextResponse.json({ success: true });
}
