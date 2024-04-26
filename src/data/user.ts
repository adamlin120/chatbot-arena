import { PrismaClient } from "@/prisma/client";
import { db } from "@/app/api/_base";

export const getUserByEmail = async (email: string) => {
  try {
    
    const user = await db.user.findFirst({ where: { email: email } });
    // db.$disconnect();
    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    
    const user = await db.user.findFirst({ where: { id: id } });
    // db.$disconnect();
    return user;
  } catch {
    return null;
  }
};
