import { z } from "zod";

const privateEnvSchema = z.object({
  DATABASE_URL: z.string(),
  OPENAI_KEY: z.string(),
  ANTHROPIC_KEY: z.string(),
  MISTRAL_KEY: z.string(),
  RESEND_API_KEY: z.string(),
});

type PrivateEnv = z.infer<typeof privateEnvSchema>;

export const privateEnv: PrivateEnv = {
  DATABASE_URL: process.env.DATABASE_URL!,
  OPENAI_KEY: process.env.OPENAI_KEY!,
  ANTHROPIC_KEY: process.env.ANTHROPIC_KEY!,
  MISTRAL_KEY: process.env.MISTRAL_KEY!,
  RESEND_API_KEY: process.env.RESEND_API_KEY!,
};

privateEnvSchema.parse(privateEnv);
