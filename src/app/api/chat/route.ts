'force dynamic';

import { Message, ModelResponse } from "@/lib/types/db";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/prisma/client";
import { StreamingTextResponse } from "ai";
import getStream from "@/lib/chat/stream";
import { getModelByConversationRecordId } from "@/data/conversation";
/* Database Schema
// schema.prisma

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  email         String   @unique
  username      String
  provider      String
  hashedPassword String
  coins         Int
  avatarUrl     String
  bio           String
  verified      Boolean
  conversations Conversation[]
}

model Verification {
  email         String    @id @map("_id")
  token         String         
  expires       DateTime 
}

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

### Get Chat Streaming

Endpoint: /api/chat/

method: POST

Request:

```typescript
{
  "message": Messages[],
  "conversationRecordId": String

}
```
*/

export const dynamic = "force-dynamic";

export const maxDuration = 250;

export async function POST(request: NextRequest) {
  try {
    const db = new PrismaClient();

    // Get the message from the request query
    const requestBody = await request.json();
    // Please use a validator in production
    const messages = requestBody.messages as Message[];
    //ConversationId might be null, if it is, create a new conversation
    const conversationRecordId = requestBody.conversationRecordId as string;

    if (!messages || !conversationRecordId) {
      console.log("requestBody", requestBody);
      return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }

    const model = await getModelByConversationRecordId(conversationRecordId);

    if (!model) {
      return NextResponse.json({ error: "Invalid Model" }, { status: 400 });
    }

    const stream = await getStream(
      messages,
      model,
      async (response: ModelResponse) => {
        // Append the prompt and the response to the conversationRecord with the conversationRecordId
        try {
          const db = new PrismaClient();
          if (!response.completion) return;
          await db.conversationRecord.update({
            where: {
              id: conversationRecordId,
            },
            data: {
              rounds: {
                push: {
                  prompt: response.prompt,
                  completion: response.completion,
                },
              },
            },
          });
        }
        catch (error) {
          console.error(error);
        }
      },
    );

    db.$disconnect();

    return new StreamingTextResponse(stream || new ReadableStream(), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
