import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";
import { getUserByEmail } from "@/data/user";

/*
Below is the schema for conversation:

```
model Conversation {
  id             String   @id @map("_id") @default(auto()) @db.ObjectId
  contributor    User     @relation(fields: [contributorId], references: [id])
  contributorId  String   @db.ObjectId
  records        ConversationRecord[]
}

model ConversationRecord {
  id         String   @id @map("_id") @default(auto()) @db.ObjectId
  rounds ConversationRound[]
  conversation Conversation @relation(fields: [conversationId], references: [id])
  conversationId String @db.ObjectId
}

model ConversationRound {
  id         String   @id @map("_id") @default(auto()) @db.ObjectId
  prompt     String
  completion    String
  model_name String
  rating     Int
  ConversationRecord ConversationRecord @relation(fields: [ConversationRecordId], references: [id])
  ConversationRecordId String @db.ObjectId
}
```

### Initiate Chat

Endpoint: /api/chat/initiate

Method: POST

Request: No request body

Response:

```typescript
{
  "conversationRecordId": [
    String,
    String
  ]
}
```
Two conversation record ids are returned. These ids are used to identify the two conversation records that are created for the conversation. The conversation records are created for the two users who are having the conversation. The conversation records are used to store the conversation rounds between
*/

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const db = new PrismaClient();
  //Read user id from nextauth session
  let conversation;
  const session = await auth();
  if (!session || !session.user) {
    //return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    conversation = await db.conversation.create({
      data: {
        contributorId: "6622924f82b05d4bf154d3e9",
      },
    });

  }
  else {
    const user = await getUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversation = await db.conversation.create({
      data: {
        contributorId: user.id,
      },
    });
  }
  if (!conversation){
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }
  const conversationRecords = await Promise.all([
    db.conversationRecord.create({
      data: {
        conversationId: conversation.id,
      },
    }),
    db.conversationRecord.create({
      data: {
        conversationId: conversation.id,
      },
    }),
  ]);

  const conversationRecordId = conversationRecords.map((record) => record.id);

  db.$disconnect();

  return NextResponse.json({ conversationRecordId });
}
