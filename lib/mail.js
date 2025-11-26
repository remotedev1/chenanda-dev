"use server";
import { Resend } from "resend";

const api = process.env.RESEND_API_KEY;
const domain = process.env.NEXT_PUBLIC_APP_URL;

let resend = null;

// Initialize Resend with the API key
if (api) {
  resend = new Resend(api);
} else {
  throw new Error(
    "RESEND_API_KEY is not defined in the environment variables."
  );
}

export const sendPasswordResetEmail = async (tokenData) => {
  const resetLink = `${domain}/auth/reset-password?token=${tokenData.token}`;

  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: tokenData.email,
      subject: "Reset your password",
      html: `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`,
    });

    // ✅ Success check
    if (response?.data?.id) {
      console.log("✅ Email sent successfully:", response.data.id);
      return true;
    } else {
      const errorMessage = response?.data?.error || "Unknown error occurred";
      console.error("❌ Email sending failed:", errorMessage);
      return false;
    }
  } catch (error) {
    console.error("❌ Error while sending email:", error);
    return false;
  }
};

export const sendVerificationEmail = async (tokenData) => {
  const confirmLink = `${domain}/auth/email-verification?token=${tokenData.token}`;

  try {
    const response = await resend.emails.send({
      from: "Test <onboarding@resend.dev>",
      to: tokenData.email,
      subject: "Confirm your email",
      html: `<p>Click <a href="${confirmLink}">here</a> to confirm email. </p>`,
    });

    // ✅ Success check
    if (response?.data?.id) {
      console.log("✅ Email sent successfully:", response.data.id);
      return true;
    } else {
      const errorMessage = response?.data?.error || "Unknown error occurred";
      console.error("❌ Email sending failed:", errorMessage);
      return false;
    }
  } catch (error) {
    console.error("❌ Error while sending email:", error);
    return false;
  }
};
