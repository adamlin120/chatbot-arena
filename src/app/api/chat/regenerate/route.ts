import { Message } from "@/lib/types/db";
import { NextRequest, NextResponse } from "next/server";
import { StreamingTextResponse } from "ai";
import getStream from "@/lib/chat/stream";
import {
  getModelByConversationRecordId,
  messagesToConversationRound,
  findForkIndexOfTwoList,
} from "@/data/conversation";
import { db } from "../../_base";

export const dynamic = "force-dynamic";
export const maxDuration = 250;

/*
Request:

```typescript
{
  "message": Messages[],
  "conversationRecordId": String
}
```

Response:

TextStreamingResponse object
*/

export async function POST(request: NextRequest) {
  const { message, conversationRecordId } = await request.json();

  if (!message || !conversationRecordId) {
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
  const currentConversationRecordRounds = messagesToConversationRound(message);
  if (!currentConversationRecordRounds) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }
  const forkIndex = await findForkIndexOfTwoList(
    prevConversationRecordRounds,
    currentConversationRecordRounds,
  );

  if (forkIndex === 0) {
    return NextResponse.json({ error: "No fork found" }, { status: 400 });
  }

  // Let the database record all messages after the fork
  const forkedConversationRound =
    currentConversationRecordRounds.slice(forkIndex);
  const newConversationRecord = await db.conversationRecord.update({
    where: {
      id: conversationRecordId,
    },
    data: {
      rounds: {
        push: forkedConversationRound,
      },
    },
  });

  const modelName = await getModelByConversationRecordId(conversationRecordId);

  if (!modelName) {
    return NextResponse.json(
      { error: "Invalid conversation record" },
      { status: 400 },
    );
  }

  const stream = await getStream(message, modelName, conversationRecordId);

  return new StreamingTextResponse(stream || new ReadableStream(), {
    status: 200,
  });
}
