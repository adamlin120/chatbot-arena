import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail } from "@/data/user";
import { ANONYMOUS_USER_ID } from "@/lib/auth";
import { db } from "../../../_base";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  //Read user id from nextauth session
  let id;
  const session = await auth();
  if (!session || !session.user) {
    id = ANONYMOUS_USER_ID;
  } else {
    const user = await getUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    id = user.id;
  }

  const { conversationRecordId } = await request.json();

  if (!conversationRecordId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Get the conversation record by conversationRecordId

  const conversationRecord = await db.conversationRecord.findFirst({
    where: {
      id: conversationRecordId,
    },
  });

  if (!conversationRecord) {
    return NextResponse.json(
      { error: "Invalid conversation record" },
      { status: 400 },
    );
  }

  const conversationId = conversationRecord.conversationId;

  // Create a new conversation record with its prevConversationRecordId set to the conversationRecordId

  const newConversationRecordId = await db.conversationRecord.create({
    data: {
      conversationId,
      prevConversationRecordId: conversationRecordId,
      modelName: conversationRecord.modelName,
    },
  });

  // Append the new conversation record to the nextConversationRecords of the conversationRecord

  await db.conversationRecord.update({
    where: {
      id: conversationRecordId,
    },
    data: {
      nextConversationRecords: {
        connect: {
          id: newConversationRecordId.id,
        },
      },
    },
  });

  return NextResponse.json({
    conversationRecordId: newConversationRecordId.id,
  });
}
