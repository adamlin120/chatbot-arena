'force dynamic';

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/prisma/client";
import { auth } from "@/lib/auth";
import { getUserByEmail } from "@/data/user";
import { ANONYMOUS_USER_ID } from "@/lib/auth";
import {
  getSiblingConversationRecord,
  checkIfRoundExists,
  editRatingByConversationRecordId,
  getModelByConversationRecordId,
} from "@/data/conversation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const db = new PrismaClient();
  const session = await auth();
  var userId;
  if (!session || !session.user) {
    userId = ANONYMOUS_USER_ID;
  } else {
    const user = await getUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = user.id;
  }

  const { conversationRecordId, rating } = await request.json();

  //check whether conversation id is the same as the user id

  const conversation = await db.conversationRecord.findFirst({
    where: {
      id: conversationRecordId,
      conversation: {
        contributorId: userId,
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  await editRatingByConversationRecordId(
    conversationRecordId,
    conversationRoundRating,
  );
  await editRatingByConversationRecordId(
    siblingRecordId,
    siblingConversationRoundRating,
  );

  db.$disconnect();
  return NextResponse.json([
    {
      conversationRecordId,
      model: await getModelByConversationRecordId(conversationRecordId),
    },
    {
      conversationRecordId: siblingRecordId,
      model: await getModelByConversationRecordId(siblingRecordId),
    },
  ]);
}
