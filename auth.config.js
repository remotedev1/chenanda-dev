import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/helpers/user";
import { LoginSchema } from "./schemas/auth.schema";

const config = {
  providers: [
    // Email/Password login
    Credentials({
      id: "credentials",
      name: "Credentials",
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await getUserByEmail(email);
          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
            return {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              phoneNumber: user.phoneNumber,
              familyId: user.familyId,
            };
          }
        }
        return null;
      },
    }),

    // Phone OTP login
    Credentials({
      id: "phone-credentials",
      name: "Phone Credentials",
      async authorize(credentials) {
        const { phoneNumber, password } = credentials;

        if (!phoneNumber || !password) return null;

        const user = await db.user.findUnique({
          where: { phoneNumber: phoneNumber.trim() },
        });

        if (!user || !user.password) return null;
        if (user.isBlocked || !user.isActive) return null;

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) return null;

        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          phoneNumber: user.phoneNumber,
          familyId: user.familyId,
        };
      },
    }),
  ],

  callbacks: {
    async jwt(params) {
      if (params?.user) {
        // Add user properties to the token
        params.token.role = params.user.role;
        params.token.email = params.user.email;
        params.token.firstName = params.user.firstName;
        params.token.lastName = params.user.lastName;
        params.token.phoneNumber = params.user.phoneNumber;
        params.token.familyId = params.user.familyId;
      }
      return params.token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.email = token.email;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.phoneNumber = token.phoneNumber;
        session.user.familyId = token.familyId;
      }
      return session;
    },

    async signIn({ user, account }) {
      // Allow sign in if user exists
      return !!user;
    },
  },

  pages: {
    signIn: "auth/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default config;
