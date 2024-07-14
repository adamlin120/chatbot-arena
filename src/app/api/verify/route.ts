import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token";

import { NextRequest, NextResponse } from "next/server";
import { db } from "../_base";

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const existingToken = await getVerificationTokenByToken(reqBody.token);

    if (!existingToken) {
      return NextResponse.json({ error: "Token does not exist!" });
    }

    const hasExpired =
      !existingToken.expires || existingToken.expires < new Date();

    if (hasExpired) {
      return NextResponse.json(
        { error: "Token has expired. Get a new one." },
        { status: 410 },
      );
    }

    const existingUser = await getUserByEmail(existingToken.email);

    if (!existingUser) {
      return NextResponse.json(
        { error: "User does not exist!" },
        { status: 404 },
      );
    }

    await db.user.update({
      where: { email: existingUser.email },
      data: { verified: true },
    });
    await db.verification.delete({ where: { email: existingUser.email } });

    return NextResponse.json({ success: "Email verified!" }, { status: 200 });
  } catch (error) {
    // Handle errors
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong!" },
      { status: 500 },
    );
  }
}
