import * as z from "zod";

const IndianPhoneNumberRegex = /^[6789]\d{9}$/;

export const indianStates = [
  "Andhra Pradesh",
  "Karnataka",
  "Kerala",
  "Maharashtra",
  "Tamil Nadu",
  "Telangana",
];

export const SettingsSchema = z
  .object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    // role: z.enum([UserRole.ADMIN, UserRole.USER]),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(6)),
    newPassword: z.optional(z.string().min(6)),
  })
  .refine(
    (data) => {
      if (data.password && !data.newPassword) {
        return false;
      }

      return true;
    },
    {
      message: "New password is required!",
      path: ["newPassword"],
    },
  )
  .refine(
    (data) => {
      if (data.newPassword && !data.password) {
        return false;
      }

      return true;
    },
    {
      message: "Password is required!",
      path: ["password"],
    },
  );

export const ResetPasswordSchema = z.object({
  password: z.string().min(6, {
    message: "Minimum of 6 characters required",
  }),
});

export const ChangePasswordSchema = z
  .object({
    oldPassword: z.string().min(6, "Old password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string("Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const ForgotPasswordSchema = z.object({
  email: z.string().email({
    message: "invalid email address",
  }),
});

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string(),
});

export const RegisterSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters.")
      .max(30, "First name must be less than 30 characters.")
      .trim(),

    lastName: z
      .string()
      .max(30, "Last name must be less than 30 characters.")
      .trim()
      .optional()
      .or(z.literal("")),

    email: z.string().email("Invalid email address.").toLowerCase().trim(),

    phoneNumber: z
      .string()
      .regex(IndianPhoneNumberRegex, "Enter a valid 10-digit phone number.")
      .trim(),

    alternateNumber: z
      .string()
      .regex(IndianPhoneNumberRegex, "Enter a valid 10-digit phone number.")
      .trim()
      .optional()
      .or(z.literal("")),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(100, "Password is too long."),

    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.alternateNumber && data.alternateNumber.length > 0) {
        return data.phoneNumber !== data.alternateNumber;
      }
      return true;
    },
    {
      message: "Alternate number must be different from primary phone.",
      path: ["alternateNumber"],
    },
  );

/**
 * Login with phone OTP
 */
export const PhoneLoginSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number is required"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

/**
 * Send OTP
 */
export const SendOTPSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number is required"),
});

/**
 * Verify OTP
 */
export const VerifyOTPSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number is required"),
  code: z.string().length(6, "OTP must be 6 digits"),
});

// tournament schemas
export const SportTypeEnum = z.enum([
  "FIELD_HOCKEY",
  "FOOTBALL",
  "CRICKET",
  "RELAY",
  "BASKETBALL",
  "VOLLEYBALL",
  "KABADDI",
  "ATHLETICS",
  "BADMINTON",
  "TABLE_TENNIS",
  "TENNIS",
  "SQUASH",
  "CARROM",
  "CHESS",
  "THROWBALL",
  "KHO_KHO",
  "SWIMMING",
  "WRESTLING",
  "BOXING",
  "OTHER",
]);

const TournamentStatusEnum = z.enum([
  "DRAFT",
  "REGISTRATION",
  "UPCOMING",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
]);

export const createTournamentSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  year: z.number().int().min(2000).max(2100),
  sports: z.array(SportTypeEnum).min(1, "At least one sport is required"),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  registrationDeadline: z.string().datetime().optional(),
  status: TournamentStatusEnum.optional(),
  description: z.string().optional(),
  sponsors: z.array(z.any()).optional(),
  info: z.array(z.any()).optional(),
  images: z.array(z.string().url()).optional(),
});

export const querySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  status: TournamentStatusEnum.optional(),
  sport: SportTypeEnum.optional(),
  year: z.string().optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(["startDate", "name", "createdAt"])
    .optional()
    .default("startDate"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});
