import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from "bcryptjs";

import { authSchema } from "@/validators/auth";
import { generateVerificationToken } from "../token/tokens";
import { sendVerificationEmail } from "../mail/mail";
import { db } from "@/app/api/_base";

export default CredentialsProvider({
  name: "credentials",
  credentials: {
    email: { label: "Email", type: "text" },
    username: { label: "Userame", type: "text", optional: true },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials, req) {
    let validatedCredentials: {
      email: string;
      username?: string;
      password: string;
    };
    const parts = req.url.split("=");
    const isSignUp = parts.slice(1).join("=");

    try {
      validatedCredentials = authSchema.parse(credentials);
    } catch (error) {
      console.log("Wrong credentials. Try again.");
      return null;
    }
    const { email, username, password } = validatedCredentials;

    const existedUser = await db.user.findFirst({
      where: {
        email: email.toLowerCase(),
      },
    });
    if (!existedUser) {
      // Sign up
      if (!username) {
        console.log("Name is required.");
        return null;
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const createdUser = await db.user.create({
        data: {
          email: email.toLowerCase(),
          username,
          hashedPassword,
          provider: "credentials",
          coins: 0,
          avatarUrl: "",
          bio: "",
          verified: false,
        },
      });
      const verificationToken = await generateVerificationToken(email);

      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token,
      );

      return {
        email: email.toLowerCase(),
        username: username,
        id: createdUser.id,
      };
    }

    // Sign in
    if (isSignUp == "true") {
      return null;
    }
    const isValid = await bcrypt.compare(password, existedUser.hashedPassword);
    if (!isValid) {
      console.log("Wrong password. Try again.");
      return null;
    }
    if (!existedUser.verified) {
      const verificationToken = await generateVerificationToken(
        existedUser.email,
      );
      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token,
      );
    }

    return {
      email: existedUser.email,
      name: existedUser.username,
      id: existedUser.id,
    };
  },
});
