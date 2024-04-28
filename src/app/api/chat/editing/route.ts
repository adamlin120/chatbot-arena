import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/api/_base";
import { getModelByConversationRecordId } from "@/data/conversation";
import { ANONYMOUS_USER_ID } from "@/lib/auth";
import { getUserByEmail } from "@/data/user";

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const {
      conversationRecordId,
      msgIndex,
      originalPrompt,
      editedPrompt,
      originalCompletion,
      editedCompletion,
      contributorEmail,
    } = requestBody;
    const model = await getModelByConversationRecordId(conversationRecordId);

    if (!model) {
      return NextResponse.json({ message: "No model found" }, { status: 500 });
    }

    let round = await db.rateEditing.findFirst({
      where: {
        conversationRecordId: conversationRecordId,
        msgIndex: msgIndex,
      },
    });

    if (round) {
      await db.rateEditing.updateMany({
        where: {
          conversationRecordId: conversationRecordId,
          msgIndex: msgIndex,
        },
        data: {
          editedPrompt: editedPrompt,
          editedCompletion: editedCompletion,
        },
      });
      return NextResponse.json(
        { message: "Prompt&Completion updated" },
        { status: 200 },
      );
    } else {
      if (contributorEmail) {
        const user = await getUserByEmail(contributorEmail);
        const contributorId = user?.id;
        if (!contributorId) {
          return NextResponse.json(
            { error: "userId not found!" },
            { status: 404 },
          );
        }
        await db.rateEditing.create({
          data: {
            conversationRecordId: conversationRecordId,
            msgIndex: msgIndex,
            contributorId: contributorId,
            model: model,
            originalPrompt: originalPrompt,
            editedPrompt: editedPrompt,
            originalCompletion: originalCompletion,
            editedCompletion: editedCompletion,
          },
        });
      } else {
        await db.rateEditing.create({
          data: {
            conversationRecordId: conversationRecordId,
            msgIndex: msgIndex,
            contributorId: ANONYMOUS_USER_ID,
            model: model,
            originalPrompt: originalPrompt,
            editedPrompt: editedPrompt,
            originalCompletion: originalCompletion,
            editedCompletion: editedCompletion,
          },
        });
      }
      return NextResponse.json(
        { message: "Prompt&Completion Edited" },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to edit!" }, { status: 500 });
  } finally {
    // await db.$disconnect();
  }
}
