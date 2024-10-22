// getUserById

import { NextRequest, NextResponse } from "next/server";
import { db } from "../../_base";

export async function POST(req: NextRequest) {
  const requestBody = await req.json();
  try {
    const user = await db.user.findUnique({
      where: {
        id: requestBody._id,
      },
      select: {
        email: true,
        username: true,
        avatarUrl: true,
        coins: true,
        bio: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found!" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong!" },
      { status: 500 },
    );
  }
}
