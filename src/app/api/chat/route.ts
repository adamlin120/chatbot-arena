import { Message } from "@/lib/types/db";
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
  details  ConversationDetail[]
}

model ConversationDetail {
  id         String   @id @map("_id") @default(auto()) @db.ObjectId
  prompt     String
  completions Completion[]
  feedback   String?
  conversation Conversation @relation(fields: [conversationId], references: [id])
  conversationId String @db.ObjectId
}

model Completion {
  id         String   @id @map("_id") @default(auto()) @db.ObjectId
  content    String
  model_name String
  rating     Int
  conversationDetail ConversationDetail @relation(fields: [conversationDetailId], references: [id])
  conversationDetailId String @db.ObjectId
}
*/


const db = new PrismaClient();

export async function POST(request: NextRequest) {
  try {

    // Get the message from the request query
    const requestBody = await request.json();
    // Please use a validator in production
    const messages = requestBody.messages as Message[];
    const model = requestBody.model as string;
    //ConversationId might be null, if it is, create a new conversation
    const conversationId = requestBody.conversationId?.toString();

    const stream = await getStream(messages, async (response) => {
      // Save the response to the database
    });

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
