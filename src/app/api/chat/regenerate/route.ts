import { NextRequest, NextResponse } from "next/server";
import { StreamingTextResponse } from "ai";
import getStream from "@/lib/chat/stream";
import {
  getModelByConversationRecordId,
  messagesToConversationRound,
} from "@/data/conversation";
import { db } from "../../_base";

export const dynamic = "force-dynamic";
export const maxDuration = 250;

export async function POST(request: NextRequest) {
  const { messages, conversationRecordId } = await request.json();

  if (!messages || !conversationRecordId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const conversationRecord = await db.conversationRecord.findFirst({
    where: {
      id: conversationRecordId,
    },
    select: {
      prevConversationRecord: true,
    },
  });

  const prevConversationRecordRounds =
    conversationRecord?.prevConversationRecord?.rounds;
  if (!prevConversationRecordRounds) {
    return NextResponse.json({ error: "No PrevConv Found" }, { status: 404 });
  }
  const currentConversationRecordRounds = messagesToConversationRound(
    messages.slice(2),
  ); // Skip the first two messages since it is the default header message
  if (!currentConversationRecordRounds) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  const forkIndex = !currentConversationRecordRounds
    ? 0
    : currentConversationRecordRounds.length;

  // Record where the fork happened in the old conversation record by making prevConversationRecordRounds.rounds[forkIndex].modifiedConversationRecordId = conversationRecordId

  prevConversationRecordRounds[forkIndex] = {
    prompt: prevConversationRecordRounds[forkIndex].prompt,
    completion: prevConversationRecordRounds[forkIndex].completion,
    modifiedConversationRecordId: conversationRecordId,
  };

  await db.conversationRecord.update({
    where: {
      id: conversationRecord.prevConversationRecord?.id,
    },
    data: {
      rounds: prevConversationRecordRounds,
    },
  });

  const modelName = await getModelByConversationRecordId(conversationRecordId);

  if (!modelName) {
    return NextResponse.json(
      { error: "Invalid conversation record" },
      { status: 400 },
    );
  }

  const stream = await getStream(messages, modelName, conversationRecordId);

  return new StreamingTextResponse(stream || new ReadableStream(), {
    status: 200,
  });
}
