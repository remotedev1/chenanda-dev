"use server";

import bcrypt from "bcryptjs";

import { ResetPasswordSchema } from "@/schemas";
import { getUserByEmail } from "@/helpers/user";
import { db } from "@/lib/db";
import { getPasswordResetTokenByToken } from "@/lib/tokens";

export const resetPassword = async (values, token) => {
  if (!token) {
    return { error: "Missing token!" };
  }

  const validatedFields = ResetPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { password } = validatedFields.data;

  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return { error: "Invalid token!" };
  }

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  if (
    existingUser.passwordResetTokenExpires &&
    existingUser.passwordResetTokenExpires < new Date(Date.now() + 60 * 1000)
  ) {
    return {
      success:
        "Password reset token already sent to mail. Please check your inbox.",
    };
  }

  if (!existingUser.isVerified) {
    return { error: "User is not registered!" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.users.update({
    where: { email: existingUser.email },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetTokenExpires: null,
    },
  });

  return { success: "Password updated!" };
};
