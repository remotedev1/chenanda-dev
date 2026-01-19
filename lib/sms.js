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
    // For development: Just log the OTP
    if (process.env.NODE_ENV === "development") {
      console.log(`📱 OTP for ${phoneNumber}: ${otp}`);
      return { success: true };
    }

    // Production: Use your SMS provider
    // Example with Twilio:
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    await client.messages.create({
      body: `Your OTP for tournament registration is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    */

    // Example with MSG91 (Popular in India):
    /*
    const response = await fetch('https://api.msg91.com/api/v5/otp', {
      method: 'POST',
      headers: {
        'authkey': process.env.MSG91_AUTH_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        template_id: process.env.MSG91_TEMPLATE_ID,
        mobile: phoneNumber,
        otp: otp,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send SMS');
    }
    */

    // Example with AWS SNS:
    /*
    const AWS = require('aws-sdk');
    const sns = new AWS.SNS({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    await sns.publish({
      Message: `Your OTP for tournament registration is: ${otp}. Valid for 10 minutes.`,
      PhoneNumber: phoneNumber,
    }).promise();
    */

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