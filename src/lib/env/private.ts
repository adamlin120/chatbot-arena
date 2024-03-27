import { z } from "zod";

const privateEnvSchema = z.object({
  DATABASE_URL: z.string(),
  OPENAI_KEY: z.string(),
});

type PrivateEnv = z.infer<typeof privateEnvSchema>;

export const privateEnv: PrivateEnv = {
  DATABASE_URL: process.env.DATABASE_URL!,
  OPENAI_KEY: process.env.OPENAI_KEY!,
};

privateEnvSchema.parse(privateEnv);