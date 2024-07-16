import { Message } from "@/lib/types/db";
import {
  OpenAIStream,
  MistralStream,
  AnthropicStream,
  GoogleGenerativeAIStream,
} from "ai";
import OpenAI from "openai";
import MistralClient from "@mistralai/mistralai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { privateEnv } from "@/lib/env/private";
import { ModelResponse } from "@/lib/types/db";
import { db } from "@/app/api/_base";

export const MAX_TOKENS = 1024;
const temperature = 0.3;

const systemPrompt =
  "你是一個繁體中文對話機器人(Chatbot)，我會有多輪的輸入或是提問，你必須做出適當的回覆以解決我的需求。請注意，由於我們在衡量不同的大型語言模型的能力，因此在對話過程中，你不可以洩漏你的身份，也就是你不可以洩漏你的模型名稱，也不可以告訴使用者你是誰訓練的或是誰研發的。";

const openai = new OpenAI({ apiKey: privateEnv.OPENAI_KEY });
const mistral = new MistralClient(privateEnv.MISTRAL_KEY);
const anthropic = new Anthropic({ apiKey: privateEnv.ANTHROPIC_KEY });
const google = new GoogleGenerativeAI(privateEnv.GEMINI_KEY);

async function writeStreamToDatabase(
  conversationRecordId: string,
  response: ModelResponse,
  originalConversationRecordId?: string,
) {
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
            originalConversationRecordId: originalConversationRecordId,
          },
        },
      },
    });
  } catch (error) {
    console.error(error);
  }
}

export default async function getStream(
  messages: Message[],
  model: string,
  conversationRecordId: string,
  originalConversationRecordId?: string,
) {
  const messagesWithSystem: Message[] = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];
  if (model.includes("gpt")) {
    const response = await openai.chat.completions.create({
      messages: messagesWithSystem,
      model: model,
      temperature: temperature,
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
        await writeStreamToDatabase(
          conversationRecordId,
          ModelResponse,
          originalConversationRecordId,
        );
      },
    });
    return stream;
  } else if (model.includes("mistral")) {
    const response = await mistral.chatStream({
      model: model,
      maxTokens: MAX_TOKENS,
      temperature: temperature,
      messages: messagesWithSystem,
    });
    const stream = MistralStream(response, {
      onCompletion: async (response) => {
        const ModelResponse: ModelResponse = {
          prompt: messages[messages.length - 1].content,
          completion: response,
          model_name: model,
        };
        await writeStreamToDatabase(
          conversationRecordId,
          ModelResponse,
          originalConversationRecordId,
        );
      },
    });
    return stream;
  } else if (model.includes("claude")) {
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
      system: systemPrompt,
      max_tokens: MAX_TOKENS,
      temperature: temperature,
    });

    const stream = AnthropicStream(response, {
      onCompletion: async (response) => {
        const ModelResponse: ModelResponse = {
          prompt: messages[messages.length - 1].content,
          completion: response,
          model_name: model,
        };
        await writeStreamToDatabase(
          conversationRecordId,
          ModelResponse,
          originalConversationRecordId,
        );
      },
    });
    return stream;
  } else if (model.includes("Llama-3-Taiwan")) {
    // "Llama-3-Taiwan-8B-Instruct" and "Llama-3-Taiwan-70B-Instruct"
    const client = new OpenAI({
      apiKey: privateEnv.TWLLM_KEY,
      baseURL:
        model === "Llama-3-Taiwan-8B-Instruct"
          ? "http://api.openai.twllm.com:8001/v1"
          : "http://api.openai.twllm.com:8002/v1",
    });
    const response = await client.chat.completions.create({
      messages: messagesWithSystem,
      model: "yentinglin/" + model,
      temperature: temperature,
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
        await writeStreamToDatabase(
          conversationRecordId,
          ModelResponse,
          originalConversationRecordId,
        );
      },
    });
    return stream;
  } else if (model.includes("gemini")) {
    const geminiMessages = messages
      .filter(
        (message) => message.role === "user" || message.role === "assistant",
      )
      .map((message) => ({
        role: message.role === "user" ? "user" : "model",
        parts: [{ text: message.content }],
      }));

    const response = await google
      .getGenerativeModel({
        model: model,
        generationConfig: {
          maxOutputTokens: MAX_TOKENS,
          temperature: temperature,
        },
        systemInstruction: systemPrompt,
      })
      .generateContentStream({
        contents: geminiMessages,
      });

    console.log(response);

    const stream = GoogleGenerativeAIStream(response, {
      onCompletion: async (response) => {
        const ModelResponse: ModelResponse = {
          prompt: messages[messages.length - 1].content,
          completion: response,
          model_name: model,
        };
        await writeStreamToDatabase(
          conversationRecordId,
          ModelResponse,
          originalConversationRecordId,
        );
      },
    });
    return stream;
  }
}
