import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRandomRatings } from "@/data/rating";
import { getUserByEmail } from "@/data/user";
export const dynamic = "force-dynamic";

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
  
    const randomRatings = await getRandomRatings(amount, user.id); // Fetch 100 random ratings
  
    if (randomRatings.length === 0) {
      return NextResponse.json(
        {
          error: "No ratings found",
        },
        { status: 404 },
      );
    }
  
    // Process the randomRatings array to extract necessary information
    const responseData = randomRatings.map(rating => ({
      rateEditingID: rating.id,
      model: rating.model,
      originalPrompt: rating.originalPrompt,
      originalCompletion: rating.originalCompletion,
      editedPrompt: rating.editedPrompt,
      editedCompletion: rating.editedCompletion,
      contributorId: rating.contributorId,
      contributorName: rating.contributor?.username,
      contributorAvatar: rating.contributor?.avatarUrl,
      scores: rating.scores,
    }));
  
    return NextResponse.json(responseData);
  }