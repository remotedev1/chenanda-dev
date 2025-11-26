"use server";

import { signIn } from "@/auth";
import { LoginSchema } from "@/schemas";
import { getUserByEmail } from "@/helpers/user";
import { sendVerificationEmail } from "@/lib/mail";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { generateVerificationToken } from "@/lib/tokens"; // Assuming this is preferred over manual crypto.randomBytes
import { AuthError } from "next-auth"; // Import AuthError for better type checking

export const login = async (values, callbackUrl) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    // Providing more specific error details from Zod for debugging/better user feedback
    return {
      error: "Invalid fields!",
      details: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  // Retrieve the user. If not found, prevent further processing early.
  const existingUser = await getUserByEmail(email);
  if (!existingUser) {
    return { error: "Account not found. Please register." };
  }

  if (
    existingUser.verificationTokenExpires &&
    existingUser.verificationTokenExpires < new Date(Date.now() + 60 * 1000)
  ) {
    return {
      success:
        "Verification token already sent to mail. Please check your inbox.",
    };
  }

  // --- Email Verification Logic ---
  if (!existingUser.isVerified) {
    try {
      // Set token expiration to 1 minute from
      const tokenData = await generateVerificationToken(email);

      if (!tokenData?.token) {
        return {
          error: tokenData?.error,
        };
      }

      await sendVerificationEmail(tokenData);
      return {
        success: `Account not verified! A new email with a verification link has been sent!`,
      };
    } catch (err) {
      return {
        error: "Failed to send verification email. Please try again later.",
      };
    }
  }

  // --- Sign-in Attempt ---
  try {
    // The redirect property should be explicitly set based on your requirements.
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    // Catching AuthError specifically for better error handling from next-auth
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            error: "Invalid credentials. Please check your password.",
          };
        case "AccessDenied": // Example of another common AuthError type
          return {
            error:
              "Access denied. Your account might be temporarily locked or restricted.",
          };
        default:
          return {
            error:
              "An unexpected authentication error occurred. Please try again.",
          };
      }
    }
    throw error;
  }
};
