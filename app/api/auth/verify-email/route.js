import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { getVerificationTokenByToken } from "@/lib/tokens";
import { hashToken } from "@/helpers/token";

// Rate limiting for verification attempts (use Redis in production)
const verificationAttempts = new Map();
const MAX_VERIFICATION_ATTEMPTS = 10;
const ATTEMPT_WINDOW = 60 * 60 * 1000; // 1 hour

function checkVerificationRateLimit(ip) {
  const now = Date.now();
  const attempts = verificationAttempts.get(ip) || {
    count: 0,
    resetAt: now + ATTEMPT_WINDOW,
  };

  if (now > attempts.resetAt) {
    attempts.count = 0;
    attempts.resetAt = now + ATTEMPT_WINDOW;
  }

  if (attempts.count >= MAX_VERIFICATION_ATTEMPTS) {
    const remainingTime = Math.ceil((attempts.resetAt - now) / 1000 / 60);
    return {
      allowed: false,
      message: `Too many verification attempts. Please try again in ${remainingTime} minutes.`,
    };
  }

  return { allowed: true };
}

function recordVerificationAttempt(ip) {
  const now = Date.now();
  const attempts = verificationAttempts.get(ip) || {
    count: 0,
    resetAt: now + ATTEMPT_WINDOW,
  };
  attempts.count += 1;
  verificationAttempts.set(ip, attempts);
}

function clearVerificationAttempts(ip) {
  verificationAttempts.delete(ip);
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    // Security: Get client information
    const headersList = headers();
    const ip =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";

    // Security: Rate limiting
    const rateLimitCheck = checkVerificationRateLimit(ip);
    if (!rateLimitCheck.allowed) {
      console.warn(`Verification rate limit exceeded for IP: ${ip}`);
      // Redirect to error page with message
      return NextResponse.redirect(
        new URL(`/auth/verify-email/error?reason=rate-limit`, req.url)
      );
    }

    if (!token) {
      return NextResponse.redirect(
        new URL("/auth/verify-email/error?reason=missing-token", req.url)
      );
    }

    // Validate token format
    if (token.length !== 64 || !/^[a-f0-9]{64}$/i.test(token)) {
      recordVerificationAttempt(ip);
      return NextResponse.redirect(
        new URL("/auth/verify-email/error?reason=invalid-token", req.url)
      );
    }

    // ⭐ HASH THE TOKEN from URL (user sent plain token)
    const hashedToken = hashToken(token);
    console.log(hashToken);

    // Get token from database
    const existingToken = await getVerificationTokenByToken(hashedToken);

    if (!existingToken) {
      recordVerificationAttempt(ip);
      return NextResponse.redirect(
        new URL("/auth/verify-email/error?reason=invalid-or-used", req.url)
      );
    }

    // Check expiration
    const now = new Date();
    if (
      !existingToken.verificationTokenExpires ||
      existingToken.verificationTokenExpires < now
    ) {
      recordVerificationAttempt(ip);
      return NextResponse.redirect(
        new URL(
          `/auth/verify-email/error?reason=expired&email=${encodeURIComponent(
            existingToken.email
          )}`,
          req.url
        )
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { email: existingToken.email },
      select: { emailVerified: true, isBlocked: true },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/auth/verify-email/error?reason=user-not-found", req.url)
      );
    }

    if (user.emailVerified) {
      clearVerificationAttempts(ip);
      return NextResponse.redirect(
        new URL("/auth/verify-email/success?already=true", req.url)
      );
    }

    if (user.isBlocked) {
      return NextResponse.redirect(
        new URL("/auth/verify-email/error?reason=blocked", req.url)
      );
    }

    // Verify email
    await db.user.update({
      where: { email: existingToken.email },
      data: {
        emailVerified: now,
        verificationToken: null,
        verificationTokenExpires: null,
        isActive: true,
      },
    });

    clearVerificationAttempts(ip);
    console.info(`Email verified via GET: ${existingToken.email}, IP: ${ip}`);

    // Redirect to success page
    return NextResponse.redirect(
      new URL("/auth/verify-email/success", req.url)
    );
  } catch (err) {
    console.error("Email Verification GET Error:", err);
    return NextResponse.redirect(
      new URL("/auth/verify-email/error?reason=server-error", req.url)
    );
  }
}
