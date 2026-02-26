"use server";

import bcrypt from "bcryptjs";

import { ChangePasswordSchema } from "@/schemas";
import { getUserById } from "@/helpers/user";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export const changePassword = async (values) => {
  const validatedFields = ChangePasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  const { oldPassword, newPassword } = validatedFields.data;

  const user = await auth();

  const existingUser = await getUserById(user.id);

  if (!existingUser || !existingUser.password) {
    return { error: "User not found or no password set!" };
  }

  const isOldPasswordCorrect = await bcrypt.compare(
    oldPassword,
    existingUser.password
  );
  if (!isOldPasswordCorrect) {
    return { error: "Old password is incorrect!" };
  }

  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.users.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  return { success: "Password updated!" };
};
