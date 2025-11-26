"use server";

import { ForgotPasswordSchema } from "@/schemas";
import { generateResetPasswordToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/helpers/user";

export const forgotPassword = async (values) => {
  const validatedFields = ForgotPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email } = validatedFields.data;

  const existingUser = await getUserByEmail(email);
  if (!existingUser) {
    return { error: "Invalid user!" };
  }

  if (!existingUser.isVerified) {
    return { error: "User is not verified, please verify your email!" };
  }

  // Prevent spamming reset emails
  if (
    existingUser.passwordResetTokenExpires &&
    existingUser.passwordResetTokenExpires > new Date()
  ) {
    return {
      success:
        "Password reset token already sent to mail. Please check your inbox.",
    };
  }

  try {
    const tokenData = await generateResetPasswordToken(email);

    if (!tokenData?.token) {
      return { error: tokenData?.error || "Failed to generate reset token." };
    }

    await db.users.update({
      where: { email },
      data: {
        passwordResetToken: tokenData.token,
        passwordResetTokenExpires: tokenData.expires,
      },
    });

    await sendPasswordResetEmail(tokenData);

    return {
      success: "A password reset link has been sent to your email.",
    };
  } catch (err) {
    console.log(err)
    return {
      error: "Failed to send reset password email. Please try again later.",
    };
  }
};
