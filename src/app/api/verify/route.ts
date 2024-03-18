import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token";
import { db } from "@/db";
import { usersTable, verificationToken } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST (req: NextRequest) {
    try {
        const reqBody = await req.json();
        //console.log(reqBody)
        const existingToken = await getVerificationTokenByToken(reqBody.token);
    
        if (!existingToken) {
          return NextResponse.json({ error: "Token does not exist!" });
        }
    
        const hasExpired = !existingToken.expires || existingToken.expires < new Date();
        //console.log(existingToken.expires);
        //console.log(Date());
    
        if (hasExpired) {
          return NextResponse.json({ error: "Token has expired. Get a new one." },{status: 410});
        }
    
        const existingUser = await getUserByEmail(existingToken.email);
    
        if (!existingUser) {
          return NextResponse.json({ error: "User does not exist!" },{status: 404});
        }
    
        await db.update(usersTable).set({ verified: true }).where(eq(usersTable.email, existingUser.email));
        await db.delete(verificationToken).where(eq(verificationToken.email, existingUser.email));
        
        return NextResponse.json({ success: "Email verified!" },{status: 200});
      } catch (error) {
        // Handle errors
        console.error(error);
        return NextResponse.json({ error: "Something went wrong!" },{status: 500});
      }
}