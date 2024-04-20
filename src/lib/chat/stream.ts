import { Message } from "@/lib/types/db";
import { OpenAIStream, MistralStream, AnthropicStream } from "ai";
import OpenAI from "openai";
import MistralClient from "@mistralai/mistralai";
import Anthropic from "@anthropic-ai/sdk";
import { privateEnv } from "@/lib/env/private";
import { ModelResponse } from "@/lib/types/db";
export const MAX_TOKENS = 1024;

const openai = new OpenAI({ apiKey: privateEnv.OPENAI_KEY });
const mistral = new MistralClient(privateEnv.MISTRAL_KEY);
const anthropic = new Anthropic({ apiKey: privateEnv.ANTHROPIC_KEY });
export default async function getStream(
  messages: Message[],
  callback: Function,
  model_list: string[] = [
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
    "mistral-large-latest",
    "mistral-medium-latest",
    "mistral-small-latest",
    //"gpt-4",
    //"gpt-3.5-turbo",
  ],
) {
  const model = model_list[Math.floor(Math.random() * model_list.length)];
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
        callback(ModelResponse);
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
        callback(ModelResponse);
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
        callback(ModelResponse);
      },
    });
    return stream;
  }
}
