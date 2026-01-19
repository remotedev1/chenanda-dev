import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { LoginSchema } from "@/schemas";
import { getUserByEmail } from "@/helpers/user";

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
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        phoneNumber: { label: "Phone Number", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        const { phoneNumber, otp } = credentials;

        if (!phoneNumber || !otp) {
          return null;
        }

        // Find user with matching phone and OTP
        const user = await db.user.findFirst({
          where: {
            phoneNumber: phoneNumber.trim(),
            phoneOtp: otp,
          },
        });

        if (!user) {
          return null;
        }

        // Check if OTP is expired
        if (user.phoneOtpExpires && new Date() > new Date(user.phoneOtpExpires)) {
          return null;
        }

        // Check if user is blocked
        if (user.isBlocked) {
          return null;
        }

        // Check if user is active
        if (!user.isActive) {
          return null;
        }

        // Update last login
        await db.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            phoneVerified: new Date(),
            phoneOtp: null, // Clear OTP after successful login
            phoneOtpExpires: null,
          },
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
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default config;