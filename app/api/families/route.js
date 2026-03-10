// app/api/families/route.js
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

/* ---------------- SCHEMAS ---------------- */

const querySchema = z.object({
  page: z.string().default("1"),
  limit: z.string().default("500"),
  search: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "familyName", "updatedAt"])
    .default("familyName"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const createFamilySchema = z.object({
  familyName: z
    .string()
    .min(1, "Family name is required")
    .max(100, "Family name must be less than 100 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  colors: z
    .string()
    .max(500, "Colors must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  info: z.array(z.record(z.any())).optional().default([]),
  images: z.array(z.string().url("Invalid image URL")).optional().default([]),
});

/* ---------------- HANDLERS ---------------- */

async function handleGet(request) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "families:list", {
    requireAuthentication: false,
  });
  if (setup.error) return setup.error;

  // Query params
  const { searchParams } = new URL(request.url);
  const validated = querySchema.parse({
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    search: searchParams.get("search") || undefined,
    sortBy: searchParams.get("sortBy") || undefined,
    sortOrder: searchParams.get("sortOrder") || undefined,
  });

  const { page, limit, skip } = parsePagination(searchParams);

  // Build where clause
  const where = {
    ...buildSearchWhere(validated.search, ["familyName", "description"]),
  };

  // Build orderBy based on sortBy parameter
  let orderBy;
  if (validated.sortBy === "familyName") {
    orderBy = { familyName: validated.sortOrder };
  } else if (validated.sortBy === "createdAt") {
    orderBy = { createdAt: validated.sortOrder };
  } else if (validated.sortBy === "updatedAt") {
    orderBy = { updatedAt: validated.sortOrder };
  } else {
    orderBy = { familyName: "asc" };
  }

  // Fetch data with counts
  const [families, total] = await Promise.all([
    db.families.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        players: {
          select: {
            id: true,
            playerName: true,
            jerseyNumber: true,
            primarySport: true,
            isActive: true,
          },
        },
        payments: {
          select: {
            id: true,
            payerName: true,
            gameId: true,
            status: true,
          },
        },
        _count: {
          select: {
            players: true,
            participations: true,
            placements: true,
            payments: true,
          },
        },
      },
    }),
    db.families.count({ where }),
  ]);

  console.log(limit);
  return successResponse({
    data: families,
    ...buildPaginationResponse(page, limit, total, families),
  });
}

async function handlePost(request) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "families:create");
  if (setup.error) return setup.error;

  const { user } = await auth();

  // Validate body
  const body = await request.json();
  const validated = createFamilySchema.parse(body);

  // Check for duplicate family name
  const existing = await db.families.findFirst({
    where: { familyName: validated.familyName },
  });

  if (existing) {
    return errorResponse("A family with this name already exists", 409);
  }

  // Create family
  const family = await db.families.create({
    data: {
      familyName: validated.familyName,
      description: validated.description || null,
      colors: validated.colors || null,
      info: validated.info || [],
      images: validated.images || [],
    },
    include: {
      _count: {
        select: {
          players: true,
          participations: true,
          placements: true,
        },
      },
    },
  });

  // Log activity
  await logActivity({
    userId: user.id,
    action: "created",
    entity: "family",
    entityId: family.id,
    entityName: family.familyName,
    description: `Created family "${family.familyName}"`,
    request,
  });

  return successResponse(family, "Family created successfully", 201);
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "families");
export const POST = withErrorHandling(handlePost, "family");
