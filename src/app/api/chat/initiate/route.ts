import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail } from "@/data/user";
import { ANONYMOUS_USER_ID } from "@/lib/auth";
import { db } from "../../_base";
import { checkIp, quotaExceedResponse } from "@/lib/auth/ipCheck";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  //Read user id from nextauth session
  let conversation;
  const session = await auth();
  if (!session || !session.user) {
    if ((await checkIp(request)) === false) {
      return quotaExceedResponse();
    }
    conversation = await db.conversation.create({
      data: {
        contributorId: ANONYMOUS_USER_ID,
      },
    });
  } else {
    const user = await getUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    conversation = await db.conversation.create({
      data: {
        contributorId: user.id,
      },
    });

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        conversations: {
          connect: {
            id: conversation.id,
          },
        },
      },
    });
  }

  const model_list = [
    "claude-3-5-sonnet-20240620",
    "gpt-4o",
    "Llama-3-Taiwan-70B-Instruct",
    "gemini-1.5-flash",
  ];

  const modelA = model_list[Math.floor(Math.random() * model_list.length)];
  const model_list_without_A = model_list.filter((model) => model !== modelA);
  const modelB =
    model_list_without_A[
      Math.floor(Math.random() * model_list_without_A.length)
    ];
  console.log("modelA:", modelA);
  console.log("modelB:", modelB);

  if (!conversation) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  try {
    const conversationRecords = await Promise.all([
      db.conversationRecord.create({
        data: {
          conversationId: conversation.id,
          modelName: modelA,
        },
      }),
      db.conversationRecord.create({
        data: {
          conversationId: conversation.id,
          modelName: modelB,
        },
      }),
    ]);

    const conversationRecordId = conversationRecords.map((record) => record.id);

    await db.conversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        records: {
          connect: conversationRecordId.map((id) => ({ id })),
        },
      },
    });

    return NextResponse.json({ conversationRecordId });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
