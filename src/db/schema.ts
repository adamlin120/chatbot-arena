
import { relations, sql } from "drizzle-orm";
import {
  index,
  pgTable,
  uuid,
  varchar,
  timestamp,
  doublePrecision,
  integer,
  primaryKey,
  text,
  boolean,
} from "drizzle-orm/pg-core";
export const usersTable = pgTable(
    "users",
    {
      userId: uuid("userid").primaryKey().notNull().defaultRandom(),
      email: varchar("email", { length: 63 }).notNull().unique(),
      username: varchar("username", { length: 80 }).notNull(),
      hashedPassword: varchar("hashedpassword", { length: 255 }).notNull(),
      avatarUrl: text("avatarurl"),
      coins: integer("coins").notNull().default(0),
      bio: text("bio"),
      verified: boolean("verified").default(false),
    },
    (table) => ({
      userIdIndex: index("userIdIndex").on(table.userId),
    })
  );
export const verificationToken = pgTable("verify",{
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    email: varchar("email", { length: 63 }).notNull().unique(),
    token: text("token").notNull().unique(),
    expires: timestamp("expires")
})