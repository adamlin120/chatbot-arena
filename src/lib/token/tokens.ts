import { getVerificationTokenByEmail } from "@/data/verification-token";

import { v4 as uuidv4 } from "uuid";
import { db } from "@/app/api/_base";

export const generateVerificationToken = async (email: string) => {
  

  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getVerificationTokenByEmail(email);
  if (existingToken) {
    await db.verification.delete({
      where: {
        email: email,
      },
    });
  }
  const newToken = await db.verification.create({
    data: {
      email: email,
      token: token,
      expires: expires,
    },
  });

  
  return newToken;
};
