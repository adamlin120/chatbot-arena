import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "../_base";
import { getRandomRatings } from "@/lib/rating/rating";

export async function GET(req: NextRequest, res: NextResponse) {
  const user = auth();
  if (!user) {
    return NextResponse.redirect("/login");
  }
  const randomRatings = await getRandomRatings(1);

  return NextResponse.json({
    rateEditingID: randomRatings[0].id,
    originalPrompt: randomRatings[0].originalPrompt,
    originalCompletion: randomRatings[0].originalCompletion,
    editedPrompt: randomRatings[0].editedPrompt,
    editedCompletion: randomRatings[0].editedCompletion,
  });
}
