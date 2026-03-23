// lib/api/helpers.js

import { NextResponse } from "next/server";
import {
  checkRateLimit,
  incrementRateLimit,
} from "@/lib/rate-limit/rateLimiter";
import { RATE_LIMIT_PRESETS } from "@/lib/rate-limit/presets";
import { getRateLimitKey } from "@/lib/rate-limit/getRateLimitKey";
import { db } from "@/lib/db";
import { z } from "zod";
import { auth } from "@/auth";

/* ============================================
   AUTHENTICATION HELPERS
   ============================================ */

/**
 * Verify admin access and return user info
 * @returns {Promise<{userId: string, isAdmin: boolean} | null>}
 */
export async function verifyAdminAccess(request) {
  const user = await auth();

  return { userId: user.id, isAdmin: user.isAdmin || false };
}

/**
 * Middleware-style auth check with automatic error response
 */
export async function requireAuth(request) {
  const user = await verifyAdminAccess(request);
  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      user: null,
    };
  }
  return { error: null, user };
}

/* ============================================
   RATE LIMITING HELPERS
   ============================================ */

/**
 * Apply rate limiting with automatic error response
 * @param {Request} request - The request object
 * @param {string} action - The action being rate limited (e.g., "families:create")
 * @param {object} preset - Rate limit preset (default: ADMIN_API)
 * @returns {Promise<{error: NextResponse | null}>}
 */
export async function applyRateLimit(
  request,
  action,
  preset = RATE_LIMIT_PRESETS.ADMIN_API,
) {
  const rateLimitKey = getRateLimitKey(request, action);
  const rateLimitCheck = await checkRateLimit(rateLimitKey, preset);

  if (!rateLimitCheck.allowed) {
    return {
      error: NextResponse.json(
        {
          error: "Too many requests",
          retryAfter: rateLimitCheck.retryAfter,
        },
        { status: 429 },
      ),
    };
  }

  await incrementRateLimit(rateLimitKey, preset);
  return { error: null };
}

/* ============================================
   ACTIVITY LOGGING HELPERS
   ============================================ */

/**
 * Log activity to database
 */
export async function logActivity({
  userId,
  action,
  entity,
  entityId,
  entityName,
  description,
  request,
  metadata = {},
}) {
  try {
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await db.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        entityName,
        description,
        timestamp: new Date(),
        ipAddress,
        userAgent,
        // Optional: store additional metadata as JSON if your schema supports it
        // metadata: metadata,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

/**
 * Helper to generate descriptive log messages for updates
 */
export function getUpdateDescription(entityName, entityType, changes) {
  const changedFields = Object.keys(changes).join(", ");
  return `Updated ${entityType} "${entityName}". Changed fields: ${changedFields}`;
}

/* ============================================
   VALIDATION HELPERS
   ============================================ */

/**
 * Handle Zod validation errors
 */
export function handleValidationError(error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "Invalid request data", details: error.errors },
      { status: 400 },
    );
  }
  return null;
}

/**
 * Handle Prisma errors
 */
export function handlePrismaError(error, entityName = "resource") {
  // Unique constraint violation
  if (error.code === "P2002") {
    return NextResponse.json(
      { error: `A ${entityName} with this identifier already exists` },
      { status: 409 },
    );
  }

  // Record not found
  if (error.code === "P2025") {
    return NextResponse.json(
      {
        error: `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} not found`,
      },
      { status: 404 },
    );
  }

  // Foreign key constraint violation
  if (error.code === "P2003") {
    return NextResponse.json(
      { error: "Cannot perform this operation due to related records" },
      { status: 409 },
    );
  }

  return null;
}

/* ============================================
   QUERY HELPERS
   ============================================ */
/**
 * Parse and validate pagination parameters
 */
export function parsePagination(searchParams, maxLimit = 500) {
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(
    parseInt(searchParams.get("limit") || "100"),
    maxLimit,
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Build pagination response
 */
export function buildPaginationResponse(page, limit, total, items) {
  const skip = (page - 1) * limit;
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + items.length < total,
  };
}

/**
 * Build search where clause for Prisma
 */
export function buildSearchWhere(search, fields) {
  if (!search) return {};

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: search,
        mode: "insensitive",
      },
    })),
  };
}

/* ============================================
   RESPONSE HELPERS
   ============================================ */

/**
 * Success response
 */
export function successResponse(data, message, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status },
  );
}

/**
 * Error response
 */
export function errorResponse(message, status = 500, details = null) {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
    },
    { status },
  );
}

/**
 * Not found response
 */
export function notFoundResponse(entityName = "Resource") {
  return errorResponse(`${entityName} not found`, 404);
}

/* ============================================
   ENTITY HELPERS
   ============================================ */

/**
 * Check if entity exists
 */
export async function findEntity(model, id, entityName = "Resource") {
  const entity = await db[model].findUnique({ where: { id } });

  if (!entity) {
    return {
      error: notFoundResponse(entityName),
      entity: null,
    };
  }

  return { error: null, entity };
}

/**
 * Check for duplicate by field
 */
export async function checkDuplicate(
  model,
  field,
  value,
  excludeId = null,
  additionalWhere = {},
) {
  const where = {
    [field]: {
      equals: value,
      mode: "insensitive",
    },
    ...additionalWhere,
  };

  if (excludeId) {
    where.id = { not: excludeId };
  }

  const existing = await db[model].findFirst({ where });
  return existing !== null;
}

/* ============================================
   DATE VALIDATION HELPERS
   ============================================ */

/**
 * Validate date range
 */
export function validateDateRange(startDate, endDate, fieldName = "date") {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    return errorResponse(
      `End ${fieldName} must be after start ${fieldName}`,
      400,
    );
  }

  return null;
}

/**
 * Build update data object (removes undefined values)
 */
export function buildUpdateData(validated) {
  const updateData = {};

  for (const [key, value] of Object.entries(validated)) {
    if (value !== undefined) {
      updateData[key] = value;
    }
  }

  return updateData;
}

/* ============================================
   COMPOSITE HELPERS (CONVENIENCE)
   ============================================ */

/**
 * All-in-one handler for common API setup
 * Returns early if auth or rate limit fails
 */
export async function setupApiHandler(request, action, options = {}) {
  const {
    requireAuthentication = true,
    rateLimit = true,
    rateLimitPreset = RATE_LIMIT_PRESETS.ADMIN_API,
  } = options;

  let user = null;

  // Authentication
  if (requireAuthentication) {
    const authResult = await requireAuth(request);
    if (authResult.error) return authResult;
    user = authResult.user;
  }

  // Rate limiting
  if (rateLimit) {
    const rateLimitResult = await applyRateLimit(
      request,
      action,
      rateLimitPreset,
    );
    if (rateLimitResult.error) return rateLimitResult;
  }

  return { error: null, user };
}

/* ============================================
   ERROR HANDLER WRAPPER
   ============================================ */

/**
 * Wrap handler with comprehensive error handling
 */
export function withErrorHandling(handler, entityName = "resource") {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.log(`API Error:`, error);

      // Try Zod error
      const zodError = handleValidationError(error);
      if (zodError) return zodError;

      // Try Prisma error
      const prismaError = handlePrismaError(error, entityName);
      if (prismaError) return prismaError;

      // Generic error
      return errorResponse(`Failed to process ${entityName}`, 500);
    }
  };
}
