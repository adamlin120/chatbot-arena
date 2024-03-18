import { db } from "@/db";
import { verificationToken } from "@/db/schema";
import { eq } from "drizzle-orm";
export const getVerificationTokenByToken = async (token: string) => {
    try {
        const vtoken = await db.query.verificationToken.findFirst({
            where: eq(verificationToken.token,token)
        }).execute();
        return vtoken;
    } catch (error) {
        console.error(error);
        return null;
    }
};
export const getVerificationTokenByEmail = async (email: string) => {
    try {
        const vtoken = await db.query.verificationToken.findFirst({
            where: eq(verificationToken.email,email)
        }).execute();
        return vtoken;
    } catch (error) {
        console.error(error);
        return null;
    }
};