export type User = {
  id: string;
  name: string;
  email: string;
  image: string;
  coins: number;
  provider: "credentials" | "jwt";
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