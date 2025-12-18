import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Crypto from "crypto";
import { addHours } from "date-fns"; // or addMinutes
import { db } from "@/lib/db";
import { getUserByEmail } from "@/helpers/user";
import { sendPasswordResetEmail } from "@/lib/mail";
import { hashToken } from "@/helpers/token";

// Rate limiting (same as before)
const resetAttempts = new Map();
const MAX_RESET_ATTEMPTS = 3;
const RESET_COOLDOWN = 15 * 60 * 1000;

function checkResetRateLimit(email) {
  const now = Date.now();
  const attempts = resetAttempts.get(email);

  if (attempts) {
    const timeSinceLastAttempt = now - attempts.timestamp;
    if (timeSinceLastAttempt < RESET_COOLDOWN) {
      if (attempts.count >= MAX_RESET_ATTEMPTS) {
        const remainingTime = Math.ceil(
          (RESET_COOLDOWN - timeSinceLastAttempt) / 1000 / 60
        );
        return {
          allowed: false,
          message: `Too many reset attempts. Please try again in ${remainingTime} minutes.`,
        };
      }
    } else {
      resetAttempts.delete(email);
    }
  }
  return { allowed: true };
}

function recordResetAttempt(email) {
  const now = Date.now();
  const attempts = resetAttempts.get(email);
  resetAttempts.set(email, {
    count: (attempts?.count || 0) + 1,
    timestamp: now,
  });
}

export async function POST(req) {
  try {
    const headersList = headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "unknown";

    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const rateLimitCheck = checkResetRateLimit(normalizedEmail);
    if (!rateLimitCheck.allowed) {
      console.warn(
        `Password reset rate limit exceeded for: ${normalizedEmail}, IP: ${ip}`
      );
      return NextResponse.json(
        { error: rateLimitCheck.message },
        { status: 429 }
      );
    }

    const user = await getUserByEmail(normalizedEmail);

    if (!user) {
      recordResetAttempt(normalizedEmail);
      console.warn(
        `Password reset attempted for non-existent email: ${normalizedEmail}, IP: ${ip}`
      );
      return NextResponse.json({
        success:
          "If an account exists with this email, you will receive a password reset link shortly.",
      });
    }

    if (user.isBlocked) {
      console.warn(
        `Blocked user attempted password reset: ${normalizedEmail}, IP: ${ip}`
      );
      return NextResponse.json({
        success:
          "If an account exists with this email, you will receive a password reset link shortly.",
      });
    }

    // ⭐ GENERATE PLAIN TOKEN (to send via email)
    const plainToken = Crypto.randomBytes(32).toString("hex");
    // ⭐ HASH THE TOKEN (to store in database)
    const hashedToken = hashToken(plainToken);

    const resetTokenExpires = addHours(new Date(), 1);

    // ⭐ STORE HASHED TOKEN (not plain token!)
    await db.user.update({
      where: { email: normalizedEmail },
      data: {
        passwordResetToken: hashedToken, // ← Store hashed version
        passwordResetTokenExpires: resetTokenExpires,
      },
    });

    // ⭐ SEND PLAIN TOKEN via email (user needs this to reset)
    try {
      await sendPasswordResetEmail({
        email: normalizedEmail,
        token: plainToken, // ← Send plain version
        name: user.name?.split(" ")[0] || "User",
      });

      recordResetAttempt(normalizedEmail);
      console.info(
        `Password reset email sent to: ${normalizedEmail}, IP: ${ip}`
      );

      return NextResponse.json({
        success:
          "Password reset link has been sent to your email. The link will expire in 1 hour.",
      });
    } catch (emailError) {
      console.error(
        `Failed to send reset email to ${normalizedEmail}:`,
        emailError
      );

      await db.user.update({
        where: { email: normalizedEmail },
        data: {
          passwordResetToken: null,
          passwordResetTokenExpires: null,
        },
      });

      return NextResponse.json(
        {
          error: "Failed to send password reset email. Please try again later.",
        },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Forgot Password API Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
