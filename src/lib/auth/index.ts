import NextAuth from "next-auth";
import CredentialsProvider from "./CredentialsProvider";

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  providers: [CredentialsProvider],
  callbacks: {
    async session({ session }) {
      const email = session?.user?.email;
      if (!email) {
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
  },
  pages: {
    signIn: "../../../login"
  }
});