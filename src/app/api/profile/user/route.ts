// getUserById

import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const requestBody = await req.json();
  //console.log(requestBody._id)
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: requestBody._id,
      },
      select: {
        email: true,
        username: true,
        avatarUrl: true,
        coins: true,
        bio: true
      },
    });
    if (!user) {
      return NextResponse.json(
        { error: "User not found!" },
        { status: 404 },
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong!" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}