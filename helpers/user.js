import { db } from "@/lib/db";

export const getUserByEmail = async (email) => {
  try {
    //leave password out of the returned user object
    // const user = await db.users.findUnique({ where: { email }, select: {
    //   id: true,
    //   name: true,
    //   email: true,
    //   role: true,
    // } });
    // return user;
    //or return the full user object
    // if you need the password for authentication purposes
    // you can use the following line instead
    // but be careful with exposing sensitive information
    // in your application
    const user = await db.users.findUnique({ where: { email } });
    return user;
  } catch (err) {
    console.log(err)
    return null;
  }
};

export const getUserById = async (id) => {
  try {
    const user = await db.users.findUnique({ where: { id } });
    return user;
  } catch (err) {
    return null;
  }
};
