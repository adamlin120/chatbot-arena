// editUserByEmail

import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const requestBody = await req.json();
    //console.log(requestBody)
    try {
        const user = await prisma.user.update({
            where: {
                email: requestBody.email,
            },
            data: {
                //coins: requestBody.coins,
                bio: requestBody.bio
            }
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