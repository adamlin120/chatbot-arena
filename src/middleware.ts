import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail } from "@/data/user";
import { ANONYMOUS_USER_ID } from "@/lib/auth";

function isNoAnonymousRoute(url: string) {
  // check if the url is a route that does not allow anonymous users
  const noAnonymousRoutes = [
    "/rating",
    "/rating/*",
    "/profile((?!/redirect$).*)",
    "/api/profile((?!/redirect$).*)"
  ];
  // use regex to check if the url matches any of the noAnonymousRoutes
  const regex = new RegExp(noAnonymousRoutes.join("|"));
  return regex.test(url);
}

// A middleware to add authentication to the request
export async function middleware(req: NextRequest) {
  const currentPath = req.url.split("/")[0] + "//" + req.url.split("/")[2];
  const session = await auth();
  var redicrectRes = NextResponse.redirect(currentPath + "/login");
  redicrectRes.cookies.delete("session");
  redicrectRes.cookies.delete("authjs.csrf-token")
  var userId;
  if (!session || !session.user) {
    if (isNoAnonymousRoute(req.url)) {
      return redicrectRes;
    }
    else {
      userId = ANONYMOUS_USER_ID;
    }
  } else {
    const user = await getUserByEmail(session.user.email);
    if (!user) {
      return redicrectRes;
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
    // all paths under /api/chat and /chat
    "/(api/chat.*)",
    "/(chat.*)",
    // all paths under /rating
    "/(api/rating.*)",
    "/(rating.*)",
    // all paths under /profile and /api/profile except /profile/redirect
    "/profile((?!/redirect$).*)",
    "/api/profile((?!/redirect$).*)"
  ],
};
