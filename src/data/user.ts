import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getUserByEmail = async (email: string) => {
    try {
        const user = await db.query.usersTable.findFirst({where: eq(usersTable.email,email)})
        return user;
    }catch{
        return null;
    }
}

export const getUserById = async (id: string) => {
    try {
        const user = await db.query.usersTable.findFirst({where: eq(usersTable.userId,id)})
        return user;
    }catch{
        return null;
    }
}