import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const requestBody = await req.json();
  const ip = requestBody.ip;
  const existingTrail = await prisma.trail.findFirst({
    where: { ip: ip },
  });
  if (existingTrail) {
    return NextResponse.json(
      { message: "IP already exists", quota: existingTrail.quota },
      { status: 200 },
    );
  }
  try {
    // Store the IP address and set quota to 0
    await prisma.trail.create({
      data: {
        quota: 0,
        ip: ip,
      },
    });
    return NextResponse.json(
      { message: "IP and quota stored successfully", quota: 0 },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to store IP and quota" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
