import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRandomRatings, updateRating } from "@/data/rating";
import { getUserByEmail } from "@/data/user";
import { ANONYMOUS_USER_ID } from "@/lib/auth";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.redirect("/login");
  }
  const user = await getUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const randomRatings = await getRandomRatings(1, user.id);

  if (randomRatings.length === 0) {
    return NextResponse.json(
      {
        error: "No ratings found",
      },
      { status: 404 },
    );
  }
  const contributor = randomRatings[0].contributor;

  return NextResponse.json({
    rateEditingID: randomRatings[0].id,
    originalPrompt: randomRatings[0].originalPrompt,
    originalCompletion: randomRatings[0].originalCompletion,
    editedPrompt: randomRatings[0].editedPrompt,
    editedCompletion: randomRatings[0].editedCompletion,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  let userId;
  if (!session || !session.user) {
    userId = ANONYMOUS_USER_ID;
  } else {
    const user = await getUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = user.id;
  }
  const data = await req.json();
  const { rateEditingID, promptEditedScore, completionEditedScore, feedback } =
    data;
  if (!rateEditingID || !promptEditedScore || !completionEditedScore) {
    return NextResponse.json(
      {
        success: false,
        message: "Missing required fields",
      },
      { status: 400 },
    );
  }

  try {
    await updateRating(
      userId,
      promptEditedScore,
      completionEditedScore,
      rateEditingID,
      feedback,
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Update failed",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
  });
}
