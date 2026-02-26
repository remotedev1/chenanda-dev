import { z } from "zod";
import bcryptjs from "bcryptjs";
import Crypto from "crypto";
import { addHours } from "date-fns";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  successResponse,
  errorResponse,
  withErrorHandling,
} from "@/lib/api/helpers";
import { getUserByEmail } from "@/helpers/user";
import { sendVerificationEmail } from "@/lib/mail";
import { hashToken } from "@/helpers/token";

/* ---------------- SCHEMAS ---------------- */

const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  alternateNumber: z.string().optional(),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
});

/* ---------------- HANDLERS ---------------- */

async function handlePost(request) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "auth:register");
  if (setup.error) return setup.error;

  // Parse and validate body
  const body = await request.json();
  const validatedFields = RegisterSchema.safeParse(body);

  if (!validatedFields.success) {
    return errorResponse(
      "Invalid fields!",
      400,
      validatedFields.error.flatten().fieldErrors,
    );
  }

  const { email, password, phoneNumber, alternateNumber, firstName, lastName } =
    validatedFields.data;

  // Security: Normalize inputs
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedPhone = phoneNumber.trim();

  // Security: Check for existing user and phone in a single query
  const [existingUser, existingPhoneUser] = await Promise.all([
    getUserByEmail(normalizedEmail),
    db.user.findFirst({
      where: { phoneNumber: normalizedPhone },
    }),
  ]);

  // Security: Generic error to prevent enumeration
  if (existingUser || existingPhoneUser) {
    console.warn(
      `Duplicate registration attempt - Email: ${normalizedEmail}, Phone: ${normalizedPhone}`,
    );

    return errorResponse(
      "An account with this email or phone number already exists. Please try logging in or use different credentials.",
      409,
    );
  }

  // Check alternate number if provided
  if (alternateNumber) {
    const normalizedAlternate = alternateNumber.trim();

    // Check if alternate number is same as primary
    if (normalizedAlternate === normalizedPhone) {
      return errorResponse(
        "Alternate number cannot be the same as primary phone number.",
        400,
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
      return errorResponse("This alternate number is already registered.", 409);
    }
  }

  // Hash password with stronger cost factor
  const hashedPassword = await bcryptjs.hash(password, 12);

  // Generate plain token (to send via email)
  const plainToken = Crypto.randomBytes(32).toString("hex");

  // Hash the token (to store in database)
  const hashedToken = hashToken(plainToken);

  const verifyTokenExpires = addHours(new Date(), 1);

  // Create user in database
  const newUser = await db.user.create({
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      phoneNumber: normalizedPhone,
      alternateNumber: alternateNumber ? parseInt(alternateNumber) : null,
      password: hashedPassword,
      emailVerificationToken: hashedToken,
      emailVerificationTokenExpires: verifyTokenExpires,
      isActive: true,
      isBlocked: false,
      images: [],
    },
  });

  // Send verification email (non-blocking)
  sendVerificationEmail({
    email: normalizedEmail,
    token: plainToken,
    name: firstName,
  }).catch((emailError) => {
    console.error(
      `Failed to send verification email to ${normalizedEmail}:`,
      emailError,
    );
  });

  return successResponse(
    {
      userId: newUser.id,
      email: normalizedEmail,
    },
    "Account created successfully! Please check your email to verify your account.",
    201,
  );
}

/* ---------------- EXPORTS ---------------- */

export const POST = withErrorHandling(handlePost, "register");
