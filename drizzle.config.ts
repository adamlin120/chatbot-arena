import dotenv from "dotenv";
import type { Config } from "drizzle-kit";

// this file is for drizzle-kit, which is used to do our database migrations
dotenv.config({ path: "./.env" });

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL must be defined in .env");
}

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: { connectionString: process.env.POSTGRES_URL },
  verbose: true,
} satisfies Config;