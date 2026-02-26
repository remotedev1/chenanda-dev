import { errorResponse, setupApiHandler, successResponse, withErrorHandling } from "@/lib/api/helpers";
import { db } from "@/lib/db";
import { PhoneSchema } from "@/schemas/auth.schema";
import Crypto from "crypto";
import { addMinutes } from "date-fns";

async function handlePost(request) {
  const setup = await setupApiHandler(request, "auth:send-otp", {
    requireAuthentication: false,
  });
  if (setup.error) return setup.error;

  const body = await request.json();
  const result = PhoneSchema.safeParse(body);
  if (!result.success) {
    return errorResponse(result.error.errors[0].message, 400);
  }

  const normalizedPhone = result.data.phoneNumber.trim();

  // Delete any existing OTP for this number before creating a new one
  await db.otpVerification.deleteMany({
    where: { phoneNumber: normalizedPhone },
  });

  const otp = Crypto.randomInt(100000, 999999).toString();

  await db.otpVerification.create({
    data: {
      phoneNumber: normalizedPhone,
      otp,
      expiresAt: addMinutes(new Date(), 10),
    },
  });

  try {
    // await sendOTPSMS(normalizedPhone, otp);
  } catch (error) {
    console.error("Failed to send OTP:", error);
    // Clean up if SMS fails
    await db.otpVerification.deleteMany({
      where: { phoneNumber: normalizedPhone },
    });
    return errorResponse("Failed to send OTP. Please try again.", 500);
  }

  return successResponse(
    { phoneNumber: normalizedPhone, expiresIn: 600 },
    "OTP sent successfully",
  );
}

/* ---------------- EXPORTS ---------------- */

export const POST = withErrorHandling(handlePost, "register-phone-otp");
