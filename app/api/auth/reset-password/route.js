import { NextResponse } from "next/server";
import { headers } from "next/headers";
import bcryptjs from "bcryptjs";
import Crypto from "crypto";
import { db } from "@/lib/db";
import { hashToken } from "@/helpers/token";

const passwordResetAttempts = new Map();
const MAX_PASSWORD_RESET_ATTEMPTS = 5;
const PASSWORD_RESET_WINDOW = 60 * 60 * 1000;

function checkPasswordResetRateLimit(ip) {
  const now = Date.now();
  const attempts = passwordResetAttempts.get(ip) || {
    count: 0,
    resetAt: now + PASSWORD_RESET_WINDOW,
  };

  if (now > attempts.resetAt) {
    attempts.count = 0;
    attempts.resetAt = now + PASSWORD_RESET_WINDOW;
  }

  if (attempts.count >= MAX_PASSWORD_RESET_ATTEMPTS) {
    const remainingTime = Math.ceil((attempts.resetAt - now) / 1000 / 60);
    return {
      allowed: false,
      message: `Too many password reset attempts. Please try again in ${remainingTime} minutes.`,
    };
  }

  return { allowed: true };
}

function recordPasswordResetAttempt(ip) {
  const now = Date.now();
  const attempts = passwordResetAttempts.get(ip) || {
    count: 0,
    resetAt: now + PASSWORD_RESET_WINDOW,
  };
  attempts.count += 1;
  passwordResetAttempts.set(ip, attempts);
}

export async function POST(req) {
  try {
    const headersList = headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "unknown";

    const rateLimitCheck = checkPasswordResetRateLimit(ip);
    if (!rateLimitCheck.allowed) {
      console.warn(`Password reset rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: rateLimitCheck.message },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required." },
        { status: 400 }
      );
    }

    // Validate token format
    if (token.length !== 64 || !/^[a-f0-9]{64}$/i.test(token)) {
      recordPasswordResetAttempt(ip);
      console.warn(`Invalid reset token format from IP: ${ip}`);
      return NextResponse.json(
        { error: "Invalid or expired reset token." },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 8 || password.length > 100) {
      return NextResponse.json(
        { error: "Password must be between 8 and 100 characters." },
        { status: 400 }
      );
    }
    // ⭐ HASH THE TOKEN from URL (user sent plain token)
    const hashedToken = hashToken(token);

    // ⭐ FIND USER BY HASHED TOKEN (not plain token!)
    const user = await db.user.findFirst({
      where: { passwordResetToken: hashedToken }, // ← Compare hashed versions
      select: {
        id: true,
        email: true,
        passwordResetToken: true,
        passwordResetTokenExpires: true,
        isBlocked: true,
        isActive: true,
        password: true,
      },
    });

    if (!user) {
      recordPasswordResetAttempt(ip);
      console.warn(`Invalid reset token attempt from IP: ${ip}`);
      return NextResponse.json(
        { error: "Invalid or expired reset token. Please request a new one." },
        { status: 404 }
      );
    }

    // Check token expiry
    const now = new Date();
    if (
      !user.passwordResetTokenExpires ||
      user.passwordResetTokenExpires < now
    ) {
      recordPasswordResetAttempt(ip);
      console.warn(`Expired reset token attempt for: ${user.email}, IP: ${ip}`);

      await db.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: null,
          passwordResetTokenExpires: null,
        },
      });

      return NextResponse.json(
        {
          error:
            "This reset link has expired. Please request a new password reset.",
          expired: true,
        },
        { status: 410 }
      );
    }

    // Check if user is blocked
    if (user.isBlocked) {
      console.warn(
        `Blocked user attempted password reset: ${user.email}, IP: ${ip}`
      );
      return NextResponse.json(
        { error: "Your account has been suspended. Please contact support." },
        { status: 403 }
      );
    }

    // Check if new password is same as old
    const isSamePassword = await bcryptjs.compare(password, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { error: "New password cannot be the same as your current password." },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(password, 12);

    // Update password and clear token
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetTokenExpires: null,
          updatedAt: new Date(),
        },
      });
    });

    console.info(`Password reset successful for: ${user.email}, IP: ${ip}`);

    return NextResponse.json({
      success:
        "Password has been reset successfully. You can now log in with your new password.",
    });
  } catch (err) {
    console.error("Reset Password API Error:", err);
    return NextResponse.json(
      { error: "Failed to reset password. Please try again later." },
      { status: 500 }
    );
  }
}
