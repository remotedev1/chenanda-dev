import { NextResponse } from "next/server";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { LoginSchema } from "@/schemas";
import { getUserByEmail } from "@/helpers/user";
import { sendVerificationEmail } from "@/lib/mail";
import { generateVerificationToken } from "@/lib/tokens";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import {
  checkRateLimit,
  incrementRateLimit,
  clearRateLimit,
} from "@/lib/rate-limit/rateLimiter";

import { RATE_LIMIT_PRESETS } from "@/lib/rate-limit/presets";
import { getRateLimitKey } from "@/lib/rate-limit/getRateLimitKey";

export async function POST(req) {
  try {
    const body = await req.json();
    const { values, callbackUrl } = body;
    const validatedFields = LoginSchema.safeParse(values);

    const { email, password } = validatedFields.data;

    // Security: Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Validate input
    if (!validatedFields.success) {
      return NextResponse.json(
        {
          error: "Invalid fields!",
          details: validatedFields.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const key = getRateLimitKey({
      prefix: "login",
      email: normalizedEmail,
    });

    const rate = checkRateLimit(key, RATE_LIMIT_PRESETS.AUTH);

    if (!rate.allowed) {
      return NextResponse.json({ error: rate.message }, { status: 429 });
    }

    // Check if user exists
    const existingUser = await getUserByEmail(normalizedEmail);

    // Security: Generic error message to prevent email enumeration
    if (!existingUser) {
      incrementRateLimit(normalizedEmail);
      // Don't reveal that account doesn't exist
      return NextResponse.json(
        { error: "Invalid credentials. Please check your email or password." },
        { status: 401 }
      );
    }

    // Security: Check if user is blocked
    if (existingUser.isBlocked) {
      return NextResponse.json(
        { error: "Your account has been suspended. Please contact support." },
        { status: 403 }
      );
    }

    // Security: Check if user is active
    if (!existingUser.isActive) {
      return NextResponse.json(
        {
          error:
            "Your account is inactive. Please contact support to reactivate.",
        },
        { status: 403 }
      );
    }

    // Check if email verification is required
    if (existingUser.verificationToken) {
      const tokenAge =
        Date.now() - new Date(existingUser.verificationTokenExpires).getTime();
      if (tokenAge < 24 * 60 * 60 * 1000) {
        return NextResponse.json(
          {
            error:
              "Account not verified. Please check your email for the verification link.",
            requiresVerification: true,
          },
          { status: 403 }
        );
      }
    }

    if (!existingUser.emailVerified) {
      const tokenData = await generateVerificationToken(normalizedEmail);

      if (tokenData?.token) {
        await sendVerificationEmail(tokenData);
      }
      return NextResponse.json(
        {
          error:
            "Account not verified. Please check your email for the verification link.",
          requiresVerification: true,
        },
        { status: 403 }
      );
    }

    // Sign-in with next-auth
    try {
      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        incrementRateLimit(normalizedEmail);

        return NextResponse.json(
          {
            error: `Invalid credentials. Please check your email or password.${warningMessage}`,
            remainingAttempts: remainingAttempts > 0 ? remainingAttempts : 0,
          },
          { status: 401 }
        );
      }

      // Success: Clear rate limiting attempts
      clearRateLimit(key);

      return NextResponse.json({
        success: "Login successful!",
        redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        incrementRateLimit(key);

        switch (error.type) {
          case "CredentialsSignin":
            return NextResponse.json(
              { error: "Invalid credentials. Please check your password." },
              { status: 401 }
            );
          case "AccessDenied":
            return NextResponse.json(
              { error: "Access denied. Your account may be restricted." },
              { status: 403 }
            );
          default:
            console.error(`Auth error for ${normalizedEmail}:`, error);
            return NextResponse.json(
              { error: "Authentication failed. Please try again." },
              { status: 500 }
            );
        }
      }
      throw error;
    }
  } catch (err) {
    console.error("Login API Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
