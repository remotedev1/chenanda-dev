import { z } from "zod";
import crypto from "crypto";
import { addMinutes } from "date-fns";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  successResponse,
  errorResponse,
  withErrorHandling,
} from "@/lib/api/helpers";
import { sendOTPSMS } from "@/lib/sms";

/* ---------------- SCHEMAS ---------------- */

const sendOTPSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number is required"),
});

/* ---------------- HANDLERS ---------------- */

async function handlePost(request) {
  // Setup (rate limit only, no auth needed)
  const setup = await setupApiHandler(request, "login:send-otp");
  if (setup.error) return setup.error;

  // Parse and validate body
  const body = await request.json();
  const validated = sendOTPSchema.parse(body);

  const normalizedPhone = validated.phoneNumber.trim();

  // Find user by phone number
  const user = await db.user.findUnique({
    where: { phoneNumber: normalizedPhone },
    select: {
      id: true,
      phoneNumber: true,
      isBlocked: true,
      isActive: true,
      firstName: true,
    },
  });

  // Generic error to prevent phone number enumeration
  if (!user) {
    return errorResponse(
      "If this phone number is registered, you will receive an OTP.",
      200 // Return 200 to prevent enumeration
    );
  }

  // Check if user is blocked
  if (user.isBlocked) {
    return errorResponse(
      "Your account has been suspended. Please contact support.",
      403
    );
  }

  // Check if user is active
  if (!user.isActive) {
    return errorResponse(
      "Your account is inactive. Please contact support.",
      403
    );
  }

  // Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpires = addMinutes(new Date(), 10); // 10 minutes expiry

  // Update user with new OTP
  await db.user.update({
    where: { id: user.id },
    data: {
      phoneOtp: otp,
      phoneOtpExpires: otpExpires,
    },
  });

  // Send OTP via SMS
  try {
    await sendOTPSMS(normalizedPhone, otp);
  } catch (error) {
    console.error("Failed to send OTP:", error);
    return errorResponse("Failed to send OTP. Please try again.", 500);
  }

  return successResponse(
    {
      phoneNumber: normalizedPhone,
      expiresIn: 600, // 10 minutes in seconds
    },
    "OTP sent successfully"
  );
}

/* ---------------- EXPORTS ---------------- */

export const POST = withErrorHandling(handlePost, "send-otp");