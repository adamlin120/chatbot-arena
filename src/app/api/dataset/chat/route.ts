import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRandomChats } from "@/data/chat";
import { getUserByEmail } from "@/data/user";
export const dynamic = "force-dynamic";
export const maxDuration = 300;
export async function GET(req: any) {
  const amount = req.nextUrl.searchParams.get("amount");
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.redirect("/login");
  }
  const user = await getUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const randomChats = await getRandomChats(amount, user.id); // Fetch 100 random chats

  if (randomChats.length === 0) {
    return NextResponse.json(
      {
        error: "No ratings found",
      },
      { status: 404 },
    );
  }

  // Process the randomChats array to extract necessary information
  const responseData = randomChats.map((chat) => ({
    id: chat.id,
    conversationId: chat.conversationId,
    modelName: chat.modelName,
    rounds: chat.rounds,
  }));
  return NextResponse.json(responseData);
}
