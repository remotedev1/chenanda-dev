"use server";

import { db } from "@/lib/db";
import { getVerificationTokenByToken } from "@/lib/tokens";

export const emailVerification = async (token) => {
  const existingToken = await getVerificationTokenByToken(token);


  if (!existingToken) {
    return { error: "Token does not exist or already been used!" };
  }

  const tokenExpiration = existingToken.verificationTokenExpires;
  const now = new Date();

  if (!tokenExpiration || tokenExpiration < now) {
    return { error: "Token has expired!" };
  }

  await db.users.update({
    where: { email: existingToken.email },
    data: {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    },
  });

  return { success: "Email verified!" };
};
