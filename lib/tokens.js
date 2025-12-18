import crypto from "crypto";

import { db } from "@/lib/db";
// TODO : delete this import if not used
import { addHours } from "date-fns";
import { hashToken } from "@/helpers/token";

// Generate a verification token for email verification
export const generateVerificationToken = async (email) => {
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = hashToken(token);
  const verifyTokenExpires = addHours(new Date(), 1);
  try {
    await db.user.update({
      where: { email },
      data: {
        verificationToken: hashedToken,
        verificationTokenExpires: verifyTokenExpires,
      },
    });

    return { email, token };
  } catch (err) {
    console.error("⚠️ Failed to generate verification token:", err);
    throw new Error("User not found or failed to update verification token.");
  }
};

export const getVerificationTokenByToken = async (token) => {
  try {
    const user = await db.user.findFirst({
      where: {
        verificationToken: token,
      },
    });
    return user;
  } catch (err) {
    return null;
  }
};

export const getVerificationTokenByEmail = async (email) => {
  try {
    const { verificationToken } = await db.user.findUnique({
      where: { email },
    });

    return verificationToken;
  } catch {
    return null;
  }
};

// Generate a password reset token for the user
export const generateResetPasswordToken = async (email) => {
  const token = crypto.randomBytes(32).toString("hex");

  const expires = addHours(new Date(), 1);
  try {
    await db.user.update({
      where: { email },
      data: {
        passwordResetToken: token,
        passwordResetTokenExpires: expires,
      },
    });

    return { email, token };
  } catch (err) {
    console.error("⚠️ Failed to generate verification token:", err);
    throw new Error("User not found or failed to update verification token.");
  }
};

export const getPasswordResetTokenByToken = async (token) => {
  try {
    const user = await db.user.findFirst({
      where: { passwordResetToken: token },
    });
    return user;
  } catch (err) {
    return null;
  }
};

export const getPasswordResetTokenByEmail = async (email) => {
  try {
    const { passwordResetToken } = await db.user.findUnique({
      where: { email },
    });

    return passwordResetToken;
  } catch {
    return null;
  }
};
