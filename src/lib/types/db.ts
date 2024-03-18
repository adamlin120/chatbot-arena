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