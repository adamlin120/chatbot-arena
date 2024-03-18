import NextAuth from "next-auth";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import CredentialsProvider from "./CredentialsProvider";

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  providers: [CredentialsProvider],
  callbacks: {
    async session({ session }) {
      const email = session?.user?.email;
      if (!email) return session;

      const [user] = await db
        .select({
          id: usersTable.userId,
          username: usersTable.username,
          email: usersTable.email,
          avatarUrl: usersTable.avatarUrl,
          coins: usersTable.coins,
          bio: usersTable.bio,
          verified: usersTable.verified,
        })
        .from(usersTable)
        .where(eq(usersTable.email, email.toLowerCase()))
        .execute();

      return {
        ...session,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
          coins: user.coins,
          bio: user.bio,
          verified: user.verified,
        },
      };
    },
  },
  pages: {
    signIn: "../../../login"
  }
});