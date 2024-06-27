import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail } from "@/data/user";
import unzipper from "unzipper";
import { db } from "../../_base";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const ANONYMOUS_MODEL_NAME = "ChatGPT-From-User-Upload";
// const ANONYMOUS_CONVERSATION_ID = "0".repeat(24);

interface Conversation {
  current_node: string | null;
  mapping: { [key: string]: Node };
}

interface Node {
  message?: Message;
  parent: string | null;
}

interface Message {
  author: {
    role: string;
  };
  content: {
    content_type: string;
    parts: string[];
  };
  metadata: {
    is_user_system_message: boolean;
  };
}

interface ConversationMessage {
  author: string;
  text: string;
}

// Below is from ChatGPT exported chat.html
const getConversationMessages = (
  conversation: Conversation,
): ConversationMessage[] => {
  const messages: ConversationMessage[] = [];
  let currentNode = conversation.current_node;
  while (currentNode !== null) {
    const node = conversation.mapping[currentNode];
    if (
      node.message &&
      node.message.content &&
      node.message.content.content_type === "text" &&
      node.message.content.parts.length > 0 &&
      node.message.content.parts[0].length > 0 &&
      (node.message.author.role !== "system" ||
        node.message.metadata.is_user_system_message)
    ) {
      let author = node.message.author.role;
      if (author === "assistant") {
        author = "ChatGPT";
      } else if (
        author === "system" &&
        node.message.metadata.is_user_system_message
      ) {
        author = "Custom user info";
      }
      messages.push({ author, text: node.message.content.parts[0] });
    }
    currentNode = node.parent;
  }
  return messages.reverse();
};

const processFile = async (
  conversationJsonFile: unzipper.File,
  controller: ReadableStreamDefaultController,
) => {
  const session = await auth();
  if (!session || !session.user) {
    controller.enqueue(
      `data: ${JSON.stringify({ error: "Unauthorized" })}\n\n`,
    );
    controller.close();
    return;
  }
  const user = await getUserByEmail(session.user.email);
  if (!user) {
    controller.enqueue(
      `data: ${JSON.stringify({ error: "Unauthorized" })}\n\n`,
    );
    controller.close();
    return;
  }

  const fileContent = await conversationJsonFile.buffer();
  const conversationJson: [] = JSON.parse(fileContent.toString("utf-8"));
  const totalConversations = conversationJson.length;
  let currentFinished = 0;

  const processConversation = async (
    conversation: Conversation,
    userId: string,
    controller: ReadableStreamDefaultController,
    totalConversations: number,
  ) => {
    const messages = getConversationMessages(conversation);
    const rounds = [];
    for (let j = 0; j < messages.length; j += 2) {
      rounds.push({
        prompt: messages[j].text,
        completion: messages[j + 1]?.text || "",
        modifiedConversationRecordId: null,
        originalConversationRecordId: null,
      });
    }

    currentFinished += 0.05;
    controller.enqueue(
      `data: ${JSON.stringify({ progress: Math.round((currentFinished / totalConversations) * 100) })}\n\n`,
    );

    try {
      const dbConversation = await db.conversation.create({
        data: {
          contributorId: userId,
        },
      });
      currentFinished += 0.25;
      controller.enqueue(
        `data: ${JSON.stringify({ progress: Math.round((currentFinished / totalConversations) * 100) })}\n\n`,
      );

      const dbConversationRecord = await db.conversationRecord.create({
        data: {
          rounds: rounds,
          conversationId: dbConversation.id,
          modelName: ANONYMOUS_MODEL_NAME,
        },
      });
      currentFinished += 0.25;
      controller.enqueue(
        `data: ${JSON.stringify({ progress: Math.round((currentFinished / totalConversations) * 100) })}\n\n`,
      );

      await Promise.all([
        db.user.update({
          where: { id: userId },
          data: { conversations: { connect: { id: dbConversation.id } } },
        }),
        db.conversation.update({
          where: { id: dbConversation.id },
          data: { records: { connect: { id: dbConversationRecord.id } } },
        }),
      ]);

      currentFinished += 0.45;
      controller.enqueue(
        `data: ${JSON.stringify({ progress: Math.round((currentFinished / totalConversations) * 100) })}\n\n`,
      );
    } catch (e) {
      console.error(e);
      controller.enqueue(
        `data: ${JSON.stringify({ error: "Failed to save conversation" })}\n\n`,
      );
    }
  };

  const promises = conversationJson.map((conversation) =>
    processConversation(conversation, user.id, controller, totalConversations),
  );

  Promise.all(promises)
    .then(() => {
      controller.enqueue(
        `data: ${JSON.stringify({ progress: 100, complete: true })}\n\n`,
      );
      controller.close();
    })
    .catch((e) => {
      console.error(e);
      controller.enqueue(
        `data: ${JSON.stringify({ error: "Invalid file content" })}\n\n`,
      );
      controller.close();
    });
};

export async function POST(req: any) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.redirect("/login");
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "No file found" }, { status: 400 });
  }

  // test if the file is a zip file
  if (!file.name.endsWith(".zip")) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  // unzip the file using unzipper
  const zip = await unzipper.Open.buffer(Buffer.from(await file.arrayBuffer()));
  const conversationJsonFile = zip.files.find(
    (f) => f.path === "conversations.json",
  );

  if (!conversationJsonFile) {
    return NextResponse.json({ error: "Invalid zip file" }, { status: 400 });
  }

  // Create a new ReadableStream for SSE
  const stream = new ReadableStream({
    start(controller) {
      processFile(conversationJsonFile, controller);
    },
  });

  // Return the stream as the response
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
