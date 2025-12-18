import { NextResponse } from "next/server";
import { headers } from "next/headers";
import bcryptjs from "bcryptjs";
import Crypto from "crypto";
import { addMinutes } from "date-fns";

import { getUserByEmail } from "@/helpers/user";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";
import { RegisterSchema } from "@/schemas";
import { hashToken } from "@/helpers/token";
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

    // Validate input
    const validatedFields = RegisterSchema.safeParse(body);
    if (!validatedFields.success) {
      return NextResponse.json(
        {
          error: "Invalid fields!",
          details: validatedFields.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      email,
      password,
      phoneNumber,
      alternateNumber,
      firstName,
      lastName,
    } = validatedFields.data;

    // Security: Normalize inputs
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phoneNumber.trim();

    const key = getRateLimitKey({
      prefix: "login",
      email: normalizedEmail,
    });

    const rate = checkRateLimit(key, RATE_LIMIT_PRESETS.AUTH);

    if (!rate.allowed) {
      return NextResponse.json({ error: rate.message }, { status: 429 });
    }

    // Security: Check for existing user and phone in a single query
    // This prevents timing attacks that could reveal which field exists
    const [existingUser, existingPhoneUser] = await Promise.all([
      getUserByEmail(normalizedEmail),
      db.user.findFirst({
        where: { phoneNumber: normalizedPhone },
      }),
    ]);

    // Security: Generic error to prevent enumeration
    if (existingUser || existingPhoneUser) {
      incrementRateLimit(key);
      console.warn(
        `Duplicate registration attempt - Email: ${normalizedEmail}, Phone: ${normalizedPhone}, IP: ${ip}`
      );

      // Don't reveal which field is duplicate
      return NextResponse.json(
        {
          error:
            "An account with this email or phone number already exists. Please try logging in or use different credentials.",
        },
        { status: 409 } // Conflict
      );
    }

    // Check alternate number if provided
    if (alternateNumber) {
      const normalizedAlternate = alternateNumber.trim();

      // Check if alternate number is same as primary
      if (normalizedAlternate === normalizedPhone) {
        return NextResponse.json(
          {
            error:
              "Alternate number cannot be the same as primary phone number.",
          },
          { status: 400 }
        );
      }

      const existingAlternateUser = await db.user.findFirst({
        where: {
          OR: [
            { phoneNumber: normalizedAlternate },
            { alternateNumber: normalizedAlternate },
          ],
        },
      });

      if (existingAlternateUser) {
        incrementRateLimit(key);
        return NextResponse.json(
          { error: "This alternate number is already registered." },
          { status: 409 }
        );
      }
    }

    try {
      // Hash password with stronger cost factor
      const hashedPassword = await bcryptjs.hash(password, 12);

      // ⭐ GENERATE PLAIN TOKEN (to send via email)
      const plainToken = Crypto.randomBytes(32).toString("hex");

      // ⭐ HASH THE TOKEN (to store in database)
      const hashedToken = hashToken(plainToken);

      const verifyTokenExpires = addHours(new Date(), 1);

      // Create user in database first
      const newUser = await db.user.create({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: normalizedEmail,
          phoneNumber: normalizedPhone,
          alternateNumber: alternateNumber ? parseInt(alternateNumber) : null,
          password: hashedPassword,
          verificationToken: hashedToken,
          verificationTokenExpires: verifyTokenExpires,
          isActive: true,
          isBlocked: false,
          images: [],
          // Note: emailVerified will be null until verification
        },
      });

      // Send verification email (non-blocking)
      // If this fails, user is still created but needs to request new verification
      sendVerificationEmail({
        email: normalizedEmail,
        token,
        name: firstName,
      }).catch((emailError) => {
        console.error(
          `Failed to send verification email to ${normalizedEmail}:`,
          emailError
        );
        // Log to monitoring service in production
      });

      // Clear rate limit on successful registration
      clearRateLimit(key);
      return NextResponse.json(
        {
          success:
            "Account created successfully! Please check your email to verify your account.",
          userId: newUser.id,
          email: normalizedEmail,
        },
        { status: 201 }
      );
    } catch (dbError) {
      console.error("Database error during registration:", dbError);
      incrementRateLimit(key);
      // Check for unique constraint violations
      if (dbError.code === "P2002") {
        return NextResponse.json(
          { error: "An account with these credentials already exists." },
          { status: 409 }
        );
      }

      throw dbError;
    }
  } catch (err) {
    console.error("Registration API Error:", err);
    clearRateLimit(key);

    return NextResponse.json(
      { error: "Registration failed. Please try again later." },
      { status: 500 }
    );
  }
}
