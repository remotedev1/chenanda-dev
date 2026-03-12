// app/api/users/[id]/route.js
import { z } from "zod";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  successResponse,
  errorResponse,
  logActivity,
  withErrorHandling,
} from "@/lib/api/helpers";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

/* ---------------- SCHEMAS ---------------- */

export const updateUserSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be less than 100 characters")
    .optional(),
  lastName: z
    .string()
    .max(100, "Last name must be less than 100 characters")
    .optional(),
  email: z.string().email("Invalid email format").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .optional()
    .or(z.literal("")),
  alternateNumber: z.string().optional().or(z.literal("")),
  role: z.enum(["USER", "MANAGER", "ADMIN", "SUPER_ADMIN"]).optional(),
  isActive: z.boolean().optional(),
  isBlocked: z.boolean().optional(),
  emailVerified: z.date().nullable().optional(),
  phoneVerified: z.date().nullable().optional(),
  images: z.array(z.string()).optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
});

/* ---------------- HANDLERS ---------------- */

async function handleGet(request, { params }) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "users:read");
  if (setup.error) return setup.error;

  const { user } = await auth();
  const { id } = params;

  // Ability check - users can view their own profile or admins can view any
  const ability = defineAbilityFor(user);
  if (!ability.can(ACTIONS.READ, RESOURCES.USER) && user.userId !== id) {
    return errorResponse("You don't have permission to view this user", 403);
  }

  // Fetch user
  const targetUser = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      emailVerified: true,
      phoneNumber: true,
      alternateNumber: true,
      phoneVerified: true,
      role: true,
      isActive: true,
      isBlocked: true,
      images: true,
      address: true,
      lastLoginAt: true,
      lastLoginIp: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          Tournament: true,
          sponsor: true,
          activityLogs: true,
        },
      },
    },
  });

  if (!targetUser) {
    return errorResponse("User not found", 404);
  }

  return successResponse(targetUser);
}

async function handlePatch(request, { params }) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "users:update");
  if (setup.error) return setup.error;

  const { user } = await auth();
  const { userId } = params;

  // Check if user exists
  const existingUser = await db.user.findUnique({
    where: { id :userId},
  });

  if (!existingUser) {
    return errorResponse("User not found", 404);
  }

  // Validate body
  const body = await request.json();
  const validated = updateUserSchema.parse(body);

  // Permission checks
  const ability = defineAbilityFor(user);
  const isOwnProfile = user.userId === id;
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  // Only super admin can change these fields
  const superAdminOnlyFields = ["role", "isBlocked", "isActive"];
  const hasSuperAdminOnlyChanges = superAdminOnlyFields.some(
    (field) => validated[field] !== undefined,
  );

  if (hasSuperAdminOnlyChanges && !isSuperAdmin) {
    return errorResponse(
      "Only super admin can change role, block status, or active status",
      403,
    );
  }

  // Users can only edit their own profile unless they have permission
  if (!isOwnProfile && !ability.can(ACTIONS.UPDATE, RESOURCES.USER)) {
    return errorResponse("You can only edit your own profile", 403);
  }

  // Check for email uniqueness if email is being changed
  if (validated.email && validated.email !== existingUser.email) {
    const emailExists = await db.user.findUnique({
      where: { email: validated.email },
    });

    if (emailExists) {
      return errorResponse("Email already exists", 409);
    }

    // Reset email verification if email changed
    validated.emailVerified = null;
  }

  // Check for phone number uniqueness if phone is being changed
  if (
    validated.phoneNumber &&
    validated.phoneNumber !== existingUser.phoneNumber
  ) {
    const phoneExists = await db.user.findUnique({
      where: { phoneNumber: validated.phoneNumber },
    });

    if (phoneExists) {
      return errorResponse("Phone number already exists", 409);
    }

    // Reset phone verification if phone changed
    validated.phoneVerified = null;
  }

  // Hash password if it's being changed
  if (validated.password) {
    validated.password = await bcrypt.hash(validated.password, 10);
  }

  // Prepare update data
  const updateData = {
    ...(validated.firstName && { firstName: validated.firstName }),
    ...(validated.lastName !== undefined && { lastName: validated.lastName }),
    ...(validated.email && { email: validated.email }),
    ...(validated.phoneNumber !== undefined && {
      phoneNumber: validated.phoneNumber || null,
    }),
    ...(validated.alternateNumber !== undefined && {
      alternateNumber: validated.alternateNumber || null,
    }),
    ...(validated.images && { images: validated.images }),
    ...(validated.password && { password: validated.password }),
    ...(validated.emailVerified !== undefined && {
      emailVerified: validated.emailVerified,
    }),
    ...(validated.phoneVerified !== undefined && {
      phoneVerified: validated.phoneVerified,
    }),
  };

  // Only include super admin fields if user is super admin
  if (isSuperAdmin) {
    if (validated.role !== undefined) updateData.role = validated.role;
    if (validated.isActive !== undefined)
      updateData.isActive = validated.isActive;
    if (validated.isBlocked !== undefined)
      updateData.isBlocked = validated.isBlocked;
  }

  // Handle address update
  if (validated.address) {
    if (existingUser.address) {
      updateData.address = {
        update: validated.address,
      };
    } else {
      updateData.address = {
        create: validated.address,
      };
    }
  }

  // Update user
  const updatedUser = await db.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      role: true,
      isActive: true,
      isBlocked: true,
      updatedAt: true,
    },
  });

  // Log activity
  await logActivity({
    userId: user.userId,
    action: "updated",
    entity: "user",
    entityId: updatedUser.id,
    entityName: `${updatedUser.firstName} ${updatedUser.lastName}`,
    description: `Updated user "${updatedUser.firstName} ${updatedUser.lastName}"`,
    request,
  });

  return successResponse(updatedUser, "User updated successfully");
}

async function handleDelete(request, { params }) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "users:delete");
  if (setup.error) return setup.error;

  const { user } = await auth();
  const { id } = params;



  // Check if user exists
  const targetUser = await db.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          Tournament: true,
          sponsor: true,
        },
      },
    },
  });

  if (!targetUser) {
    return errorResponse("User not found", 404);
  }

  // Prevent deleting yourself
  if (user.userId === id) {
    return errorResponse("You cannot delete your own account", 400);
  }

  // Check if user has dependencies
  if (targetUser._count.Tournament > 0 || targetUser._count.sponsor > 0) {
    return errorResponse(
      "Cannot delete user with existing tournaments or sponsors. Please reassign or delete them first.",
      400,
    );
  }

  // Delete user
  await db.user.delete({
    where: { id },
  });

  // Log activity
  await logActivity({
    userId: user.id,
    action: "deleted",
    entity: "user",
    entityId: id,
    entityName: targetUser.email,
    description: `Deleted user "${targetUser.email}"`,
    request,
  });

  return successResponse({ id, deleted: true }, "User deleted successfully");
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "user");
export const PATCH = withErrorHandling(handlePatch, "user");
export const DELETE = withErrorHandling(handleDelete, "user");
