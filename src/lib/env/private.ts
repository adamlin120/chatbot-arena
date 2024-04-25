import { z } from "zod";

const privateEnvSchema = z.object({
  MONGODB_URI: z.string(),
  OPENAI_KEY: z.string(),
  ANTHROPIC_KEY: z.string(),
  MISTRAL_KEY: z.string(),
  RESEND_API_KEY: z.string(),
});

type PrivateEnv = z.infer<typeof privateEnvSchema>;

export const privateEnv: PrivateEnv = {
  MONGODB_URI: process.env.MONGODB_URI!,
  OPENAI_KEY: process.env.OPENAI_KEY!,
  ANTHROPIC_KEY: process.env.ANTHROPIC_KEY!,
  MISTRAL_KEY: process.env.MISTRAL_KEY!,
  RESEND_API_KEY: process.env.RESEND_API_KEY!,
};

privateEnvSchema.parse(privateEnv);
