// app/api/users/route.js
import { z } from "zod";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  parsePagination,
  buildPaginationResponse,
  buildSearchWhere,
  successResponse,
  errorResponse,
  logActivity,
  withErrorHandling,
} from "@/lib/api/helpers";
import { ACTIONS, defineAbilityFor, RESOURCES } from "@/lib/ability";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

/* ---------------- SCHEMAS ---------------- */

const querySchema = z.object({
  page: z.string().default("1"),
  limit: z.string().default("10"),
  search: z.string().optional(),
  role: z.enum(["USER", "MANAGER", "ADMIN", "SUPER_ADMIN"]).optional(),
  status: z.enum(["active", "inactive", "blocked"]).optional(),
  verified: z.enum(["email", "phone", "both", "none"]).optional(),
  sortBy: z
    .enum(["createdAt", "firstName", "lastName", "email", "role"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const createUserSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be less than 100 characters"),
  lastName: z
    .string()
    .max(100, "Last name must be less than 100 characters")
    .optional(),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .optional()
    .or(z.literal("")),
  alternateNumber: z.string().optional().or(z.literal("")),
  role: z.enum(["USER", "MANAGER", "ADMIN", "SUPER_ADMIN"]).default("USER"),
  isActive: z.boolean().default(true),
  isBlocked: z.boolean().default(false),
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

async function handleGet(request) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "users:list");
  if (setup.error) return setup.error;

  // Query params
  const { searchParams } = new URL(request.url);

  const validated = querySchema.parse({
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    search: searchParams.get("search") || undefined,
    role: searchParams.get("role") || undefined,
    status: searchParams.get("status") || undefined,
    verified: searchParams.get("verified") || undefined,
    sortBy: searchParams.get("sortBy") || undefined,
    sortOrder: searchParams.get("sortOrder") || undefined,
  });

  const { page, limit, skip } = parsePagination(searchParams);

  // Build where clause
  const where = {
    ...buildSearchWhere(validated.search, [
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
    ]),
    ...(validated.role && { role: validated.role }),
  };

  // Status filter
  if (validated.status === "active") {
    where.isActive = true;
    where.isBlocked = false;
  } else if (validated.status === "inactive") {
    where.isActive = false;
  } else if (validated.status === "blocked") {
    where.isBlocked = true;
  }

  // Verification filter
  if (validated.verified === "email") {
    where.emailVerified = { not: null };
  } else if (validated.verified === "phone") {
    where.phoneVerified = { not: null };
  } else if (validated.verified === "both") {
    where.AND = [
      { emailVerified: { not: null } },
      { phoneVerified: { not: null } },
    ];
  } else if (validated.verified === "none") {
    where.emailVerified = null;
    where.phoneVerified = null;
  }

  // Fetch data with counts
  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [validated.sortBy]: validated.sortOrder },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        alternateNumber: true,
        role: true,
        isActive: true,
        isBlocked: true,
        emailVerified: true,
        phoneVerified: true,
        images: true,
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true,
        updatedAt: true,
        address: true,
        _count: {
          select: {
            Tournament: true,
            sponsor: true,
          },
        },
      },
    }),
    db.user.count({ where }),
  ]);

  // Get statistics
  const [totalUsers, activeUsers, blockedUsers, adminUsers] = await Promise.all(
    [
      db.user.count(),
      db.user.count({ where: { isActive: true, isBlocked: false } }),
      db.user.count({ where: { isBlocked: true } }),
      db.user.count({
        where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      }),
    ],
  );

  return successResponse({
    data: users,
    ...buildPaginationResponse(page, limit, total, users),
    stats: {
      total: totalUsers,
      active: activeUsers,
      blocked: blockedUsers,
      admins: adminUsers,
    },
  });
}

async function handlePost(request) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "users:create");
  if (setup.error) return setup.error;

  const { user } = await auth();

  // Ability check
  const ability = defineAbilityFor(user);
  if (!ability.can(ACTIONS.CREATE, RESOURCES.USER)) {
    return errorResponse("You don't have permission to create users", 403);
  }

  // Validate body
  const body = await request.json();
  const validated = createUserSchema.parse(body);

  // Check for duplicate email
  const existingEmail = await db.user.findUnique({
    where: { email: validated.email },
  });

  if (existingEmail) {
    return errorResponse("A user with this email already exists", 409);
  }

  // Check for duplicate phone number (if provided)
  if (validated.phoneNumber) {
    const existingPhone = await db.user.findUnique({
      where: { phoneNumber: validated.phoneNumber },
    });

    if (existingPhone) {
      return errorResponse("A user with this phone number already exists", 409);
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(validated.password, 10);

  // Create user
  const newUser = await db.user.create({
    data: {
      firstName: validated.firstName,
      lastName: validated.lastName,
      email: validated.email,
      password: hashedPassword,
      phoneNumber: validated.phoneNumber || null,
      alternateNumber: validated.alternateNumber || null,
      role: validated.role,
      isActive: validated.isActive,
      isBlocked: validated.isBlocked,
      images: validated.images || [],
      address: validated.address
        ? {
            create: validated.address,
          }
        : undefined,
      createdBy: {
        connect: { id: setup.user.userId },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  // Log activity
  await logActivity({
    userId: setup.user.userId,
    action: "created",
    entity: "user",
    entityId: newUser.id,
    entityName: `${newUser.firstName} ${newUser.lastName}`,
    description: `Created user "${newUser.firstName} ${newUser.lastName}" (${newUser.email})`,
    request,
  });

  return successResponse(newUser, "User created successfully", 201);
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "users");
export const POST = withErrorHandling(handlePost, "user");
