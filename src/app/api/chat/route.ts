import { Message, ModelResponse } from "@/lib/types/db";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { StreamingTextResponse } from "ai";
import getStream from "@/lib/chat/stream";
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
      return NextResponse.json(
        { error: "Invalid Request" },
        { status: 400 }
      );
    }

    const stream = await getStream(messages, async (response : ModelResponse) => {
      // Append the prompt and the response to the conversationRecord with the conversationRecordId
      
      if (!response.completion)
        return;
      await db.conversationRound.create({
        data: {
          prompt: response.prompt,
          completion: response.completion,
          model_name: response.model_name,
          ConversationRecord: {
            connect: {
              id: conversationRecordId,
            },
          },
        },
      });
    });
    
    db.$disconnect();

    return new StreamingTextResponse(stream || new ReadableStream(), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
