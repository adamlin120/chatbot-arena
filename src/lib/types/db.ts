export type User = {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  coins: number;
  provider: "credentials";
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