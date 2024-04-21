import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const ip = requestBody.ip;

    // Find the trail with the provided IP address
    let existingTrail = await prisma.trail.findFirst({
      where: { ip: ip },
    });

    if (existingTrail) {
      // If the trail exists, update its quota
      existingTrail = await prisma.trail.update({
        where: { id: existingTrail.id },
        data: { quota: existingTrail.quota + 1 },
      });
      return NextResponse.json(
        { message: "Quota updated", quota: existingTrail.quota },
        { status: 200 },
      );
    }
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
