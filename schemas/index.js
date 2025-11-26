import { title } from "process";
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

export const ConsultationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"), // Valid 10-digit Indian mobile
  state: z.enum(indianStates, {
    errorMap: () => ({ message: "Invalid Indian state" }),
  }),
  details: z.string().optional(),
});

export const TestimonialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1).optional(),
  image: z
    .string()
    .url("Image must be a valid URL")
    .optional()
    .or(z.literal("")), 
  quote: z.string().min(1, "Quote is required"),
  isArchived: z.boolean().optional(),
});
export const SolutionsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  isArchived: z.boolean().optional(),
  image: z.array(
      z.union([
        // Case 1: Uploaded file
        z.instanceof(File),
  
        // Case 2: Saved image object
        z.object({
          url: z.string().url(),
          fileId: z.string(),
        }),
      ])
    ).optional(),
});

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
    }
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
    }
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
      .min(3, "First name is required")
      .max(30, "Must be less than or equal to 30 characters."),
    lastName: z
      .string()
      .max(30, "Must be less than or equal to 30 characters.")
      .optional(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long."),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters long."),
    phoneNumber: z
      .string()
      .regex(IndianPhoneNumberRegex, "Enter a valid contact number."),
    alternateNumber: z
      .string()
      .regex(IndianPhoneNumberRegex, "Enter a valid alternate contact number.")
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"], // shows the error under confirmPassword
  });


export const NewsSchema = z.object({
  title: z.string().min(3, "Title is required"),
  slug: z.string().min(3, "Slug is required").optional(),
  content: z.string().min(10, "Content must be at least 10 characters"),
  images: z.array(
    z.union([
      // Case 1: Uploaded file
      z.instanceof(File),

      // Case 2: Saved image object
      z.object({
        url: z.string().url(),
        fileId: z.string(),
      }),
    ])
  ),
  tags: z.array(z.string()).optional(),
  categoryId: z.string().min(3, "Category is required"),
  isPublished: z.boolean().default(false),
  deletedFileIds: z.array(z.string()).optional(),
});

// ✅ Update Schema (all optional, but keeps same shape)
export const NewsUpdateSchema = NewsSchema.partial();

export const CategorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required"),
});

export const CategoryUpdateSchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
});