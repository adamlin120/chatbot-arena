export type User = {
  id: string;
  name: string;
  email: string;
  image: string;
  coins: number;
  provider: "credentials" | "google" | "github";
  bio: string;
  verified: boolean;
};

export type Message = {
  role: "user" | "system" | "assistant";
  content: string;
};

export type ModelResponse = {
  prompt: string;
  completion: string;
  model_name: string;
};

export type ConversationRound = {
  prompt: string;
  completion: string;
  modifiedConversationRecordId?: string;
  originalConversationRecordId?: string;
};

export type conversationRoundDBOutputType = {
  prompt: string;
  completion: string;
  modifiedConversationRecordId: string | null;
  originalConversationRecordId?: string | null;
};
