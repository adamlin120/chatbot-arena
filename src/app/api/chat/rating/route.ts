import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getUserByEmail } from "@/data/user";
import { ANONYMOUS_USER_ID } from "@/lib/auth";
import {
  checkIfRoundExists,
  editRatingByConversationRecordId,
  getModelByConversationRecordId,
} from "@/data/conversation";
import { updateEloRating, computeElo } from "@/data/elo";
import { Battle, EloRating } from "@/lib/types/elo";
import { db } from "../../_base";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await auth();
  let userId;
  if (!session || !session.user) {
    userId = ANONYMOUS_USER_ID;
  } else {
    const user = await getUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = user.id;
  }

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

  let conversationRoundRating = 0;
  let siblingConversationRoundRating = 0;
  const modelA = await getModelByConversationRecordId(conversationRecordId);
  const modelB = await getModelByConversationRecordId(siblingRecordId);
  let battle: Battle = {
    modelA: modelA ? modelA : "",
    modelB: modelB ? modelB : "",
    winner: "Tie",
  };

  switch (rating) {
    case 0:
      conversationRoundRating = -2;
      siblingConversationRoundRating = -2;
      break;
    case 1:
      conversationRoundRating = 1;
      siblingConversationRoundRating = -1;
      battle.winner = "A";
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

  const originalEloRating: EloRating[] = await db.eloLeaderboard.findMany({
    select: {
      modelName: true,
      eloRating: true,
    },
  });

  const newEloRating: EloRating[] = await computeElo(originalEloRating, battle);

  await updateEloRating(newEloRating);

  return NextResponse.json([
    {
      conversationRecordId,
      model: modelA,
    },
    {
      conversationRecordId: siblingRecordId,
      model: modelB,
    },
  ]);
}
