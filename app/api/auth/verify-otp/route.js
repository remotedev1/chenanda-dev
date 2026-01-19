import { z } from "zod";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  successResponse,
  errorResponse,
  withErrorHandling,
} from "@/lib/api/helpers";

/* ---------------- SCHEMAS ---------------- */

const verifyOTPSchema = z.object({
  phoneNumber: z.string().min(10),
  code: z.string().length(6, "OTP must be 6 digits"),
});

/* ---------------- HANDLERS ---------------- */

async function handlePost(request) {
  // Setup (rate limit only)
  const setup = await setupApiHandler(request, "auth:verify-otp");
  if (setup.error) return setup.error;

  // Parse and validate body
  const body = await request.json();
  const validated = verifyOTPSchema.parse(body);

  const normalizedPhone = validated.phoneNumber.trim();

  // Find user with matching phone and OTP
  const user = await db.user.findFirst({
    where: {
      phoneNumber: normalizedPhone,
      phoneOtp: validated.code,
    },
  });

  if (!user) {
    return errorResponse("Invalid OTP", 401);
  }

  // Check if OTP is expired
  if (user.phoneOtpExpires && new Date() > new Date(user.phoneOtpExpires)) {
    return errorResponse("OTP has expired. Please request a new one.", 401);
  }

  // Mark phone as verified
  await db.user.update({
    where: { id: user.id },
    data: {
      phoneVerified: new Date(),
      phoneOtp: null, // Clear OTP after successful verification
      phoneOtpExpires: null,
    },
  });

  return successResponse(
    {
      userId: user.id,
      verified: true,
    },
    "OTP verified successfully",
  );
}

/* ---------------- EXPORTS ---------------- */

export const POST = withErrorHandling(handlePost, "verify-otp");
