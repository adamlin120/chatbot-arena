// pages/api/createUser.ts


import { NextRequest, NextResponse } from "next/server";


import { db } from "../_base";

export async function POST(req: NextRequest, res: NextResponse) {
  const reqBody = await req.json();
  const { email, username, provider, hashedPassword, coins, verified } =
    reqBody;

  try {
    const user = await db.user.create({
      data: {
        email,
        username,
        provider,
        hashedPassword,
        coins,
        verified,
      },
    });

    return NextResponse.json(
      { message: "Created Successfully!" },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong!" },
      { status: 500 },
    );
  } 
}
