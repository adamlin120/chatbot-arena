import { getVerificationTokenByEmail } from "@/data/verification-token";
import {db} from "@/db"
import { verificationToken } from "@/db/schema";
import { eq } from "drizzle-orm";
import {v4 as uuidv4} from "uuid";
export const generateVerificationToken = async (email: string) => {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600*1000);

    const existingToken = await getVerificationTokenByEmail(email);
    if (existingToken) {
        await db.delete(verificationToken)
            .where(eq(verificationToken.email, email))
            .execute();
    }
    const newToken = await db.insert(verificationToken)
        .values({
            email: email,
            token: token,
            expires: expires
        })
        .returning() // Return the inserted row
        .execute();

    return newToken;
}