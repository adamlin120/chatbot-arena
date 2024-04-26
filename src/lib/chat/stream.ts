import { Message } from "@/lib/types/db";
import { OpenAIStream, MistralStream, AnthropicStream } from "ai";
import OpenAI from "openai";
import MistralClient from "@mistralai/mistralai";
import Anthropic from "@anthropic-ai/sdk";
import { privateEnv } from "@/lib/env/private";
import { ModelResponse } from "@/lib/types/db";
import { db } from "@/app/api/_base";
export const MAX_TOKENS = 1024;

const openai = new OpenAI({ apiKey: privateEnv.OPENAI_KEY });
const mistral = new MistralClient(privateEnv.MISTRAL_KEY);
const anthropic = new Anthropic({ apiKey: privateEnv.ANTHROPIC_KEY });

async function writeStreamToDatabase(conversationRecordId: string, response: ModelResponse) {
  try {
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
}

export default async function getStream(
  messages: Message[],
  model: string,
  conversationRecordId: string,
) {
  if (model.includes("gpt")) {
    const response = await openai.chat.completions.create({
      messages: messages,
      model: model,
      temperature: 0,
      max_tokens: MAX_TOKENS,
      stream: true,
    });
    const stream = OpenAIStream(response, {
      onCompletion: async (response) => {
        const ModelResponse: ModelResponse = {
          prompt: messages[messages.length - 1].content,
          completion: response,
          model_name: model,
        };
        await writeStreamToDatabase(conversationRecordId, ModelResponse);
      },
    });
    return stream;
  } else if (model.includes("mistral")) {
    const response = await mistral.chatStream({
      model: model,
      maxTokens: MAX_TOKENS,
      messages,
    });
    const stream = MistralStream(response, {
      onCompletion: async (response) => {
        const ModelResponse: ModelResponse = {
          prompt: messages[messages.length - 1].content,
          completion: response,
          model_name: model,
        };
        await writeStreamToDatabase(conversationRecordId, ModelResponse);
      },
    });
    return stream;
  } else if (model.includes("claude")) {
    //First change the message to a messageParams object instead of a Message object

    // TODO: temporary fix, need to fix the type of messages
    type MessageParams = {
      role: "user" | "assistant";
      content: string;
    };

    const filteredMessages = messages.filter(
      (message) => message.role !== "system",
    ) as MessageParams[];

    const response = await anthropic.messages.stream({
      messages: filteredMessages,
      model: model,
      max_tokens: MAX_TOKENS,
    });

    const stream = AnthropicStream(response, {
      onCompletion: async (response) => {
        const ModelResponse: ModelResponse = {
          prompt: messages[messages.length - 1].content,
          completion: response,
          model_name: model,
        };
        await writeStreamToDatabase(conversationRecordId, ModelResponse);
      },
    });
    return stream;
  }
}
