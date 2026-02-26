import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  successResponse,
  errorResponse,
  withErrorHandling,
} from "@/lib/api/helpers";
import { PhoneSchema } from "@/schemas/auth.schema";

const VerifyOtpSchema = z.object({
  phoneNumber: PhoneSchema.shape.phoneNumber,
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must be numeric"),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
});

async function handlePost(request) {
  const setup = await setupApiHandler(request, "auth:verify-otp", {
    requireAuthentication: false,
  });
  if (setup.error) return setup.error;

  const body = await request.json();
  const result = VerifyOtpSchema.safeParse(body);
  if (!result.success) {
    return errorResponse(result.error.errors[0].message, 400);
  }

  const { phoneNumber, otp, firstName, lastName, password } = result.data;

  // Check phone isn't already registered
  const existingUser = await db.user.findUnique({ where: { phoneNumber } });
  if (existingUser) {
    return errorResponse("This phone number is already registered.", 400);
  }

  // Find OTP record
  const otpRecord = await db.otpVerification.findFirst({
    where: { phoneNumber },
  });
  if (!otpRecord) {
    return errorResponse("Invalid or expired OTP.", 400);
  }

  // Check expiry
  if (new Date() > otpRecord.expiresAt) {
    await db.otpVerification.deleteMany({ where: { phoneNumber } });
    return errorResponse("OTP has expired. Please request a new one.", 400);
  }

  // Check OTP match
  if (otpRecord.otp !== otp) {
    return errorResponse("Invalid OTP.", 400);
  }

  // OTP valid — delete it and create the user
  await db.otpVerification.deleteMany({ where: { phoneNumber } });

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      firstName,
      lastName,
      phoneNumber,
      password: hashedPassword,
      isActive: true,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      createdAt: true,
    },
  });

  return successResponse(user, "Account created successfully");
}

export const POST = withErrorHandling(handlePost, "verify-otp");
