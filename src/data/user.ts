import { PrismaClient } from '@prisma/client'

export const getUserByEmail = async (email: string) => {
    try {
        const db = new PrismaClient();
        const user = await db.user.findFirst({where: {email: email}});
        return user;
    }catch{
        return null;
    }
}

export const getUserById = async (id: string) => {
    try {
        const db = new PrismaClient();
        const user = await db.user.findFirst({where: {id: id}});
        return user;
    }catch{
        return null;
    }
}