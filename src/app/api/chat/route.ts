import { Message } from "@/lib/types/db";
import { NextRequest, NextResponse } from "next/server";
import { StreamingTextResponse } from "ai";
import getStream from "@/lib/chat/stream";
import { getModelByConversationRecordId } from "@/data/conversation";

export const dynamic = "force-dynamic";
export const maxDuration = 250;

export async function POST(request: NextRequest) {
  try {
    // This is to test frontend time out
    // await new Promise(resolve => setTimeout(resolve, 7000));

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

    const stream = await getStream(messages, model, conversationRecordId);

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
