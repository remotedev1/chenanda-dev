import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Crypto from "crypto";
import { addMinutes } from "date-fns";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";
import { getUserByEmail } from "@/helpers/user";

const resendAttempts = new Map();
const MAX_RESEND_ATTEMPTS = 3;
const RESEND_COOLDOWN = 5 * 60 * 1000; // 5 minutes

export async function GET(req) {
  try {
    const headersList = headers();
    const ip =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check cooldown
    const now = Date.now();
    const lastAttempt = resendAttempts.get(normalizedEmail);

    if (lastAttempt) {
      const timeSinceLastAttempt = now - lastAttempt.timestamp;
      if (timeSinceLastAttempt < RESEND_COOLDOWN) {
        const remainingTime = Math.ceil(
          (RESEND_COOLDOWN - timeSinceLastAttempt) / 1000 / 60
        );
        return NextResponse.json(
          {
            error: `Please wait ${remainingTime} minutes before requesting another email.`,
          },
          { status: 429 }
        );
      }

      if (lastAttempt.count >= MAX_RESEND_ATTEMPTS) {
        return NextResponse.json(
          { error: "Maximum resend attempts reached. Please contact support." },
          { status: 429 }
        );
      }
    }

    // Get user
    const user = await getUserByEmail(normalizedEmail);

    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json(
        {
          success: "If an account exists, a verification email has been sent.",
        },
        { status: 200 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified. Please try logging in." },
        { status: 400 }
      );
    }

    // Generate new token
    const token = Crypto.randomBytes(32).toString("hex");
    const expires = addMinutes(new Date(), 30);

    await db.user.update({
      where: { email: normalizedEmail },
      data: {
        verificationToken: token,
        verificationTokenExpiry: expires,
      },
    });

    // Send email
    await sendVerificationEmail({
      email: normalizedEmail,
      token,
      name: user.name?.split(" ")[0] || "User",
    });

    // Track attempt
    resendAttempts.set(normalizedEmail, {
      count: (lastAttempt?.count || 0) + 1,
      timestamp: now,
    });

    console.info(`Verification email resent to: ${normalizedEmail}, IP: ${ip}`);

    return NextResponse.json({
      success: "Verification email sent successfully. Please check your inbox.",
    });
  } catch (err) {
    console.error("Resend verification error:", err);
    return NextResponse.json(
      { error: "Failed to resend verification email." },
      { status: 500 }
    );
  }
}
