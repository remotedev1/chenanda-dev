import { NextResponse } from "next/server";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import {
  setupApiHandler,
  successResponse,
  errorResponse,
  withErrorHandling,
} from "@/lib/api/helpers";
import { getUserByEmail } from "@/helpers/user";
import { sendVerificationEmail } from "@/lib/mail";
import { generateEmailVerificationToken } from "@/lib/tokens"; 
import { LoginSchema } from "@/schemas/auth.schema";

/* ---------------- CONSTANTS ---------------- */

const DEFAULT_LOGIN_REDIRECT = "/dashboard";

/* ---------------- HANDLERS ---------------- */

async function handlePost(request) {
  // Setup (auth + rate limit)

  const setup = await setupApiHandler(request, "auth:login", {requireAuthentication: false});

  if (setup.error) return setup.error;



  // Parse and validate body
  const body = await request.json();
  const validatedFields = LoginSchema.safeParse(body.values);
  const { email, password } = validatedFields.data;

  if (!validatedFields.success) {
    return errorResponse(
      "Invalid fields!",
      400,
      validatedFields.error.flatten().fieldErrors,
    );
  }



  // Security: Normalize email
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user exists
  const existingUser = await getUserByEmail(normalizedEmail);

  // Security: Generic error message to prevent email enumeration
  if (!existingUser) {
    return errorResponse(
      "Invalid credentials. Please check your email or password.",
      401,
    );
  }

  // Security: Check if user is blocked
  if (existingUser.isBlocked) {
    return errorResponse(
      "Your account has been suspended. Please contact support.",
      403,
    );
  }

  // Security: Check if user is active
  if (!existingUser.isActive) {
    return errorResponse(
      "Your account is inactive. Please contact support to reactivate.",
      403,
    );
  }

  // Check if email verification is required
  if (existingUser.emailVerificationToken) {
    const tokenAge =
      Date.now() -
      new Date(existingUser.emailVerificationTokenExpires).getTime();

    if (tokenAge < 24 * 60 * 60 * 1000) {
      return NextResponse.json(
        {
          error:
            "Account not verified. Please check your email for the verification link.",
          requiresVerification: true,
        },
        { status: 403 },
      );
    }
  }

  if (!existingUser.emailVerified) {
    const tokenData = await generateEmailVerificationToken(normalizedEmail);

    if (tokenData?.token) {
      await sendVerificationEmail(tokenData);
    }

    return NextResponse.json(
      {
        error:
          "Account not verified. Please check your email for the verification link.",
        requiresVerification: true,
      },
      { status: 403 },
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
      return errorResponse(
        "Invalid credentials. Please check your email or password.",
        401,
      );
    }

    return successResponse(
      {
        redirectTo: "/dashboard",
      },
      "Login successful!",
    );
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return errorResponse(
            "Invalid credentials. Please check your password.",
            401,
          );
        case "AccessDenied":
          return errorResponse(
            "Access denied. Your account may be restricted.",
            403,
          );
        default:
          console.error(`Auth error for ${normalizedEmail}:`, error);
          return errorResponse("Authentication failed. Please try again.", 500);
      }
    }
    throw error;
  }
}

/* ---------------- EXPORTS ---------------- */

export const POST = withErrorHandling(handlePost, "login");
