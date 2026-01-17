import { z } from "zod";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  parsePagination,
  buildPaginationResponse,
  buildSearchWhere,
  successResponse,
  errorResponse,
  checkDuplicate,
  logActivity,
  withErrorHandling,
} from "@/lib/api/helpers";
import { defineAbilityFor } from "@/lib/ability";

/* ---------------- SCHEMAS ---------------- */

const querySchema = z.object({
  page: z.string().default("1"),
  limit: z.string().default("10"),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "familyName"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const createFamilySchema = z.object({
  familyName: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  colors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).max(10).optional(),
  images: z.array(z.string().url()).max(10).optional(),
  info: z.array(z.any()).max(20).optional(),
});

/* ---------------- HANDLERS ---------------- */

async function handleGet(request) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "families:list");
  if (setup.error) return setup.error;

  // Check ability
  const ability = defineAbilityFor(setup.user);
  if (!ability.can("read", "Family")) {
    return errorResponse("You don't have permission to view families", 403);
  }

  // Parse query params
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
  const where = buildSearchWhere(validated.search, ["familyName", "description"]);

  // Fetch data
  const [families, total] = await Promise.all([
    db.families.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [validated.sortBy]: validated.sortOrder },
      include: {
        _count: {
          select: {
            players: true,
            participations: true,
            placements: true,
          },
        },
      },
    }),
    db.families.count({ where }),
  ]);

  // Build response
  return successResponse({
    families,
    pagination: buildPaginationResponse(page, limit, total, families),
  });
}

async function handlePost(request) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "families:create");
  if (setup.error) return setup.error;

  // Check ability
  const ability = defineAbilityFor(setup.user);
  if (!ability.can("create", "Family")) {
    return errorResponse("You don't have permission to create families", 403);
  }

  // Parse and validate
  const body = await request.json();
  const validated = createFamilySchema.parse(body);

  // Check for duplicates
  const isDuplicate = await checkDuplicate(
    "families",
    "familyName",
    validated.familyName
  );

  if (isDuplicate) {
    return errorResponse("A family with this name already exists", 409);
  }

  // Create family
  const family = await db.families.create({
    data: {
      familyName: validated.familyName,
      description: validated.description,
      colors: validated.colors || [],
      images: validated.images || [],
      info: validated.info || [],
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
    userId: setup.user.userId,
    action: "created",
    entity: "family",
    entityId: family.id,
    entityName: family.familyName,
    description: `Created new family "${family.familyName}"`,
    request,
  });

  return successResponse(family, "Family created successfully", 201);
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "families");
export const POST = withErrorHandling(handlePost, "family");