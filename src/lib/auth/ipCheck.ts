import { db } from "@/app/api/_base";
import { NextRequest, NextResponse } from "next/server";

export async function checkIp(req: NextRequest, maxQuota: number = MAX_QUOTA) {
  const ip = req.headers.get("x-real-ip") ?? "127.0.0.1";

  if (!ip) {
    return false;
  }
  if (ip === "127.0.0.1") {
    return true;
  }
  let quota = 0;
  const existingtrial = await db.trial.findFirst({
    where: { ip: ip },
    select: { quota: true },
  });
  if (existingtrial) {
    quota = existingtrial.quota;
  } else {
    await db.trial.create({
      data: {
        quota: 0,
        ip: ip,
      },
    });
  }
  if (quota >= maxQuota) {
    return false;
  }
  return true;
}

export async function increaseQuotaAndCheck(
  req: NextRequest,
  maxQuota: number = MAX_QUOTA,
) {
  const ip = req.headers.get("x-real-ip") ?? "127.0.0.1";
  if (!ip) {
    return false;
  }
  if (ip === "127.0.0.1") {
    return true;
  }
  // Find the trial with the provided IP address
  let existingtrial = await db.trial.findFirst({
    where: { ip: ip },
  });

  if (existingtrial && existingtrial.quota <= maxQuota) {
    // If the trial exists, update its quota
    existingtrial = await db.trial.update({
      where: { id: existingtrial.id },
      data: { quota: existingtrial.quota + 1 },
    });
    return true;
  } else {
    return false;
  }
}

export const MAX_QUOTA = 10;

export function getRedirectResponse(req: NextRequest, url: string = "/login") {
  const currentPath = req.url.split("/")[0] + "//" + req.url.split("/")[2];
  let response = NextResponse.redirect(`${currentPath}${url}`);
  // Add a alert message to the response
  response.headers.set(
    "Set-Cookie",
    "alert=Register to unlock more conversations; Path=/",
  );
  return response;
}

export function quotaExceedResponse() {
  return NextResponse.json({ error: "Quota Exceeded" }, { status: 429 });
}
