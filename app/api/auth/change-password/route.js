import { NextResponse } from "next/server";
import { headers } from "next/headers";
import bcryptjs from "bcryptjs";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// Rate limiting for change password attempts
const changePasswordAttempts = new Map();
const MAX_CHANGE_PASSWORD_ATTEMPTS = 5;
const CHANGE_PASSWORD_WINDOW = 60 * 60 * 1000; // 1 hour

function checkChangePasswordRateLimit(userId) {
  const now = Date.now();
  const attempts = changePasswordAttempts.get(userId) || {
    count: 0,
    resetAt: now + CHANGE_PASSWORD_WINDOW,
  };

  if (now > attempts.resetAt) {
    attempts.count = 0;
    attempts.resetAt = now + CHANGE_PASSWORD_WINDOW;
  }

  if (attempts.count >= MAX_CHANGE_PASSWORD_ATTEMPTS) {
    const remainingTime = Math.ceil((attempts.resetAt - now) / 1000 / 60);
    return {
      allowed: false,
      message: `Too many password change attempts. Please try again in ${remainingTime} minutes.`,
    };
  }

  return { allowed: true };
}

function recordChangePasswordAttempt(userId) {
  const now = Date.now();
  const attempts = changePasswordAttempts.get(userId) || {
    count: 0,
    resetAt: now + CHANGE_PASSWORD_WINDOW,
  };
  attempts.count += 1;
  changePasswordAttempts.set(userId, attempts);
}

function clearChangePasswordAttempts(userId) {
  changePasswordAttempts.delete(userId);
}

export async function POST(req) {
  try {
    // Get authenticated session
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const headersList = headers();
    const ip =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";

    const userId = session.user.id;
    const userEmail = session.user.email;

    // Rate limiting check
    const rateLimitCheck = checkChangePasswordRateLimit(userId);
    if (!rateLimitCheck.allowed) {
      console.warn(
        `Change password rate limit exceeded for user: ${userEmail}, IP: ${ip}`
      );
      return NextResponse.json(
        { error: rateLimitCheck.message },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required." },
        { status: 400 }
      );
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (newPassword.length > 100) {
      return NextResponse.json(
        { error: "New password is too long." },
        { status: 400 }
      );
    }

    // Check if new password is same as current
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "New password must be different from your current password." },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await db.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        password: true,
        isBlocked: true,
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      console.warn(
        `Blocked user attempted password change: ${user.email}, IP: ${ip}`
      );
      return NextResponse.json(
        { error: "Your account has been suspended. Please contact support." },
        { status: 403 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcryptjs.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      recordChangePasswordAttempt(userId);
      console.warn(
        `Invalid current password attempt for user: ${userEmail}, IP: ${ip}`
      );

      const attempts = changePasswordAttempts.get(userId);
      const remainingAttempts =
        MAX_CHANGE_PASSWORD_ATTEMPTS - (attempts?.count || 0);

      return NextResponse.json(
        {
          error: "Current password is incorrect.",
          remainingAttempts: remainingAttempts > 0 ? remainingAttempts : 0,
        },
        { status: 401 }
      );
    }

    // Check if new password is same as old password (hash comparison)
    const isSameAsOld = await bcryptjs.compare(newPassword, user.password);
    if (isSameAsOld) {
      return NextResponse.json(
        { error: "New password cannot be the same as your current password." },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 12);

    // Update password in database
    await db.users.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    // Clear rate limiting attempts on success
    clearChangePasswordAttempts(userId);

    // Log successful password change
    console.info(
      `Password changed successfully for user: ${userEmail}, IP: ${ip}`
    );

    return NextResponse.json({
      success:
        "Password changed successfully. Please use your new password for future logins.",
    });
  } catch (err) {
    console.error("Change Password API Error:", err);
    return NextResponse.json(
      { error: "Failed to change password. Please try again later." },
      { status: 500 }
    );
  }
}
