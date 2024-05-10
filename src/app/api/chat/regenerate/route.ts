import { NextRequest, NextResponse } from "next/server";
import { StreamingTextResponse } from "ai";
import getStream from "@/lib/chat/stream";
import {
  getModelByConversationRecordId,
  messagesToConversationRound,
  findForkIndexOfTwoRounds,
  conversationRoundDBOutputTypeToConversationRound,
} from "@/data/conversation";
import { db } from "../../_base";
import {
  conversationRoundDBOutputType,
  ConversationRound,
} from "@/lib/types/db";

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

  const prevConversationRecordRoundsDBOutput:
    | conversationRoundDBOutputType[]
    | undefined = conversationRecord?.prevConversationRecord?.rounds;
  const prevConversationRecordId =
    conversationRecord?.prevConversationRecord?.id;
  if (!prevConversationRecordRoundsDBOutput) {
    return NextResponse.json({ error: "No PrevConv Found" }, { status: 404 });
  }
  const currentConversationRecordRounds = messagesToConversationRound(
    messages.slice(2),
  ); // Skip the first two messages since it is the default header message
  if (!currentConversationRecordRounds) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  let prevConversationRecordRounds: ConversationRound[] = [];
  for (const round of prevConversationRecordRoundsDBOutput) {
    prevConversationRecordRounds.push(
      conversationRoundDBOutputTypeToConversationRound(round),
    );
  }

  let forkIndex = await findForkIndexOfTwoRounds(
    prevConversationRecordRounds,
    currentConversationRecordRounds,
  );
  if (forkIndex === -1) {
    forkIndex = currentConversationRecordRounds.length;
  }

  // Record where the fork happened in the old conversation record by making prevConversationRecordRounds.rounds[forkIndex].modifiedConversationRecordId = conversationRecordId

  prevConversationRecordRounds[forkIndex] = {
    prompt: prevConversationRecordRounds[forkIndex].prompt,
    completion: prevConversationRecordRounds[forkIndex].completion,
    modifiedConversationRecordId: conversationRecordId,
    originalConversationRecordId:
      prevConversationRecordRounds[forkIndex].originalConversationRecordId,
  };
  currentConversationRecordRounds.splice(forkIndex);

  // Update the old conversation record with the modified ID at the fork index
  await db.conversationRecord.update({
    where: {
      id: prevConversationRecordId,
    },
    data: {
      rounds: prevConversationRecordRounds,
    },
  });

  // Copy the old conversation record rounds to the new conversation record rounds
  await db.conversationRecord.update({
    where: {
      id: conversationRecordId,
    },
    data: {
      rounds: currentConversationRecordRounds,
    },
  });

  const modelName = await getModelByConversationRecordId(conversationRecordId);

  if (!modelName) {
    return NextResponse.json(
      { error: "Invalid conversation record" },
      { status: 400 },
    );
  }

  const stream = await getStream(
    messages,
    modelName,
    conversationRecordId,
    prevConversationRecordId,
  );

  return new StreamingTextResponse(stream || new ReadableStream(), {
    status: 200,
  });
}
