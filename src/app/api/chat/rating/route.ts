import { NextRequest, NextResponse } from "next/server";
import { ANONYMOUS_USER_ID } from "@/lib/auth";
import {
  checkIfRoundExists,
  editRatingByConversationRecordId,
  getModelByConversationRecordId,
} from "@/data/conversation";
import { db } from "../../_base";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const headers = new Headers(request.headers);
  const userId: string = headers.get("userId") || ANONYMOUS_USER_ID;

  const { conversationRecordId, rating, siblingRecordId } =
    await request.json();

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

  const siblingConversation = await db.conversationRecord.findFirst({
    where: {
      id: siblingRecordId,
      conversation: {
        contributorId: userId,
      },
    },
  });

  if (!siblingConversation) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if the two conversation record belong to the same conversation

  if (conversation.conversationId !== siblingConversation.conversationId) {
    return NextResponse.json(
      { error: "Two record is not a pair" },
      { status: 400 },
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
