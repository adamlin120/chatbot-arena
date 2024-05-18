import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRandomRatings, updateRating } from "@/data/rating";
import { getUserByEmail } from "@/data/user";
import { ANONYMOUS_USER_ID } from "@/lib/auth";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const headers = new Headers(request.headers);
  const userId: string = headers.get("userId") || ANONYMOUS_USER_ID;

  const randomRatings = await getRandomRatings(1, userId);

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
    contributorId: randomRatings[0].contributorId,
    contributorName: contributor?.username,
    contributorAvatar: contributor?.avatarUrl,
  });
}

export async function POST(req: NextRequest, res: NextResponse) {
  const headers = new Headers(req.headers);
  const userId: string = headers.get("userId") || ANONYMOUS_USER_ID;
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
