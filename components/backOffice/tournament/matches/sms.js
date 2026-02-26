/**
 * SMS Utility Functions
 *
 * Configure with your SMS provider (Twilio, AWS SNS, MSG91, etc.)
 */

/**
 * Send OTP via SMS
 * @param {string} phoneNumber - Phone number with country code
 * @param {string} otp - 6-digit OTP
 */
export async function sendOTPSMS(phoneNumber, otp) {
  try {
    const accountSid = process.env.NEXT_PUBLIC_NEXT_PUBLIC_ACCOUNT_SID;
    const authToken = process.env.NEXT_PUBLIC_NEXT_PUBLIC_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new Error("Twilio credentials missing");
    }

    const client = require("twilio")(accountSid, authToken);

    await client.messages.create({
      body: `Your OTP for tournament registration is: ${otp}. Valid for 10 minutes.`,
      from: process.env.NEXT_PUBLIC_NEXT_PUBLIC_PHONE_NUMBER,
      to: `+91${phoneNumber}`,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send OTP SMS:", error);
    throw new Error("Failed to send OTP");
  }
}

/**
 * Send registration confirmation SMS
 * @param {string} phoneNumber - Phone number
 * @param {object} details - Registration details
 */
export async function sendRegistrationConfirmationSMS(phoneNumber, details) {
  try {
    const message = `Registration confirmed for ${details.tournamentName}! 
Family: ${details.familyName}
Games: ${details.gamesCount}
Total: ₹${details.totalAmount}
Payment pending. Visit: ${details.paymentLink}`;

    if (process.env.NODE_ENV === "development") {
      console.log(`📱 Confirmation to ${phoneNumber}:\n${message}`);
      return { success: true };
    }

    // Use your SMS provider here (same as above)

    return { success: true };
  } catch (error) {
    console.error("Failed to send confirmation SMS:", error);
    // Don't throw - this is non-critical
    return { success: false };
  }
}

/**
 * Send payment reminder SMS
 * @param {string} phoneNumber - Phone number
 * @param {object} details - Payment details
 */
export async function sendPaymentReminderSMS(phoneNumber, details) {
  try {
    const message = `Payment reminder for ${details.tournamentName}
Amount: ₹${details.amount}
Due: ${details.dueDate}
Pay now: ${details.paymentLink}`;

    if (process.env.NODE_ENV === "development") {
      console.log(`📱 Reminder to ${phoneNumber}:\n${message}`);
      return { success: true };
    }

    // Use your SMS provider here

    return { success: true };
  } catch (error) {
    console.error("Failed to send reminder SMS:", error);
    return { success: false };
  }
}
