import NextAuth from "next-auth";
//import CredentialsProvider from "./CredentialsProvider";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { PrismaClient } from "@prisma/client";
import TwitterProvider from "next-auth/providers/twitter";

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session }) {
      const name = session?.user?.name;
      if (!name) {
        // User is not logged in, so redirect to login page
        return {
          ...session,
          error: "You need to be logged in to access this page",
        };
      }
      return {
        ...session,
      };
    },
    async jwt({ token, account }) {
      const db = new PrismaClient();
      if (!account) return token;
      const provider = account.provider;
      if (!provider) return token;
      //if (!name || !email || !provider) return token;
      try {
        // Check if the email has been registered
        if (provider == "google") {
          const { name, picture, email } = token;
          if (!email || !name) return token;
          const existedUser = await db.user.findFirst({
            where: {
              email: email.toLowerCase(),
              provider: provider,
            },
          });
          if (existedUser) {
            const _id = existedUser.id;
            return { ...token, _id };
          }
          //if (provider !== "jwt") return token;
          // Sign up
          const newUser = await db.user.create({
            data: {
              email: email.toLowerCase(),
              username: name,
              hashedPassword: "jwt",
              provider: provider,
              coins: 0,
              avatarUrl: picture,
              bio: "",
              verified: true,
            },
          });
          const _id = newUser.id;
          return { ...token, _id };
        } else if (provider == "twitter") {
          const { name, picture, sub } = token;
          if (!name || !picture || !sub) return token;
          const existedUser = await db.user.findFirst({
            where: {
              email: sub,
              provider: provider,
            },
          });
          if (existedUser) {
            const _id = existedUser.id;
            return { ...token, _id };
          }
          // Sign up
          const newUser = await db.user.create({
            data: {
              email: sub, //temporately use sub in email field since twitter don't support email.
              username: name,
              hashedPassword: "jwt",
              provider: provider,
              coins: 0,
              avatarUrl: picture,
              bio: "",
              verified: true,
            },
          });
          const _id = newUser.id;
          return { ...token, _id };
        } else if (provider == "github") {
          const { name, picture, email } = token;
          if (!name || !picture || !email) return token;
          const existedUser = await db.user.findFirst({
            where: {
              email: email,
              provider: provider,
            },
          });
          if (existedUser) {
            const _id = existedUser.id;
            //console.log(token)
            return { ...token, _id };
          }
          // Sign up
          const newUser = await db.user.create({
            data: {
              email: email.toLowerCase(),
              username: name,
              hashedPassword: "jwt",
              provider: provider,
              coins: 0,
              avatarUrl: picture,
              bio: "",
              verified: true,
            },
          });
          const _id = newUser.id;
          return { ...token, _id };
        }

        return token;
      } catch (error) {
        console.error("Error in jwt function:", error);
        throw error; // Rethrow the error for handling elsewhere if needed
      } finally {
        await db.$disconnect(); // Disconnect from the database after operation
      }
    },
  },
  pages: {
    signIn: "../../../login",
  },
});
