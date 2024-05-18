import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail } from "@/data/user";
import { ANONYMOUS_USER_ID } from "@/lib/auth";

// A middleware to add authentication to the request
export async function middleware(req: NextRequest) {
  const session = await auth();
  var userId;
  if (!session || !session.user) {
    userId = ANONYMOUS_USER_ID;
  } else {
    const user = await getUserByEmail(session.user.email);
    if (!user) {
      // redirect to login page (use absolute path)
      // get current path (only the domain part)
      const currentPath = req.url.split("/")[0] + "//" + req.url.split("/")[2];
      return NextResponse.redirect(currentPath + "/login");
    }
    userId = user.id;
  }
  const headers = new Headers(req.headers);
  headers.set("userId", userId);
  const email = session ? (session.user ? session.user.email : "") : "";
  headers.set("userEmail", email);

  const response = NextResponse.next({
    request: {
      // New request headers
      headers: headers,
    },
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|auth|favicon.ico|robots.txt|images|login|public|$).*)",
  ],
};
