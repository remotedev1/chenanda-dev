import { NextResponse } from "next/server";
import { signIn } from "@/auth"; // next-auth signIn
import { AuthError } from "next-auth"; 
import { LoginSchema } from "@/schemas";
import { getUserByEmail } from "@/helpers/user";
import { sendVerificationEmail } from "@/lib/mail";
import { generateVerificationToken } from "@/lib/tokens";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export async function POST(req) {
  try {
    const body = await req.json();
    const { values, callbackUrl } = body;

    // Validate input
    const validatedFields = LoginSchema.safeParse(values);
    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields!", details: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = validatedFields.data;

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
      return NextResponse.json(
        { error: "Account not found. Please register." },
        { status: 404 }
      );
    }

    // Check email verification
    if (!existingUser.isVerified) {
      const tokenData = await generateVerificationToken(email);
      if (tokenData?.token) {
        await sendVerificationEmail(tokenData);
      }
      return NextResponse.json({
        error: "Account not verified. A new verification email has been sent.",
      });
    }

    // --- Sign-in with next-auth ---
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // don't auto redirect, handle JSON response
      });

      if (!result || result.error) {
        return NextResponse.json(
          { error: "Invalid credentials. Please check your email or password." },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: "Login successful!",
        redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case "CredentialsSignin":
            return NextResponse.json(
              { error: "Invalid credentials. Please check your password." },
              { status: 401 }
            );
          case "AccessDenied":
            return NextResponse.json(
              { error: "Access denied. Your account may be restricted." },
              { status: 403 }
            );
          default:
            return NextResponse.json(
              { error: "Authentication failed. Please try again." },
              { status: 500 }
            );
        }
      }
      throw error;
    }
  } catch (err) {
    console.error("Login API Error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
