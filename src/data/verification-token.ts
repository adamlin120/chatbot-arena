import { PrismaClient } from "@/prisma/client";
import { db } from "@/app/api/_base";

export const getVerificationTokenByToken = async (token: string) => {
  try {
    // const db = new PrismaClient();
    const vtoken = await db.verification.findFirst({
      where: {
        token: token,
      },
    });
    // db.$disconnect();
    return vtoken;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const getVerificationTokenByEmail = async (email: string) => {
  try {
    // const db = new PrismaClient();
    const vtoken = await db.verification.findFirst({
      where: {
        email: email,
      },
    });
    // db.$disconnect();
    return vtoken;
  } catch (error) {
    console.error(error);
    return null;
  }
};
