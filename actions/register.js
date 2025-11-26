"use server";

import { getUserByEmail } from "@/helpers/user";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";
import { RegisterSchema } from "@/schemas";
import bcryptjs from "bcryptjs";
import Crypto from "crypto";

import { addMinutes } from "date-fns";

export const register = async (values) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, phoneNumber, alternateNumber, firstName, lastName } =
    validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "Email already in use, please try logging in." };
  }

  //check if phone number is already registered
  const existingPhoneUser = await db.users.findFirst({
    where: { phoneNumber },
  });

  if (!!existingPhoneUser) {
    return { error: "Phone number already registered, please try logging in." };
  }

  if (!!existingUser) {
    return { error: "Email already in use, please try logging in." };
  }

  try {
    const hashedPassword = await bcryptjs.hash(password, 10);
    const token = Crypto.randomBytes(32).toString("hex");
    const expires = addMinutes(new Date(), 30);

    // Send verification email
    const emailSent = await sendVerificationEmail({
      email,
      token,
    });

    if (!emailSent) {
      return {
        error:
          "Failed to send verification email. Please correct your email address.",
      };
    }

    await db.users.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        alternateNumber: parseInt(alternateNumber),
        password: hashedPassword,
        verificationToken: token,
        verificationTokenExpires: expires,
      },
    });

    return { success: "Verification email sent, please check your inbox." };
  } catch (err) {
    console.error("Registration error:", err);
    return { error: "Something went wrong. Please try again." };
  }
};
