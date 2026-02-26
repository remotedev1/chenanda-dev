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

export async function sendPasswordResetEmail({ email, token, name }) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Request</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(to right, #4F46E5, #3B82F6); padding: 40px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Password Reset Request</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 0;">
                    Hi ${name},
                  </p>
                  
                  <p style="color: #333; font-size: 16px; line-height: 1.6;">
                    We received a request to reset your password. Click the button below to create a new password:
                  </p>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <a href="${resetUrl}" style="display: inline-block; padding: 16px 32px; background-color: #4F46E5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin: 20px 0; border-radius: 4px;">
                    <p style="color: #92400E; margin: 0; font-size: 14px;">
                      <strong>⚠️ Important:</strong> This link will expire in <strong>1 hour</strong>.
                    </p>
                  </div>
                  
                  <p style="color: #666; font-size: 14px; line-height: 1.6;">
                    If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
                  </p>
                  
                  <div style="border-top: 1px solid #e5e5e5; margin-top: 30px; padding-top: 20px;">
                    <p style="color: #666; font-size: 12px; line-height: 1.6; margin: 0;">
                      <strong>Security Tips:</strong>
                    </p>
                    <ul style="color: #666; font-size: 12px; line-height: 1.6; margin: 10px 0;">
                      <li>Never share your password with anyone</li>
                      <li>Use a strong, unique password</li>
                      <li>Enable two-factor authentication if available</li>
                    </ul>
                  </div>
                  
                  <p style="color: #999; font-size: 12px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="${resetUrl}" style="color: #4F46E5; word-break: break-all;">${resetUrl}</a>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px; text-align: center;">
                  <p style="color: #999; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} Your Company. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Send email using your email service
  // Example with Resend:
  // await resend.emails.send({
  //   from: 'noreply@yourdomain.com',
  //   to: email,
  //   subject: 'Reset Your Password',
  //   html: emailHtml,
  // });

  return true;
}

export const sendVerificationEmail = async (tokenData) => {
  const confirmLink = `${domain}/auth/verify-email?token=${tokenData.token}`;

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
