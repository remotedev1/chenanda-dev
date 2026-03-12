import { z } from "zod";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  parsePagination,
  buildPaginationResponse,
  buildSearchWhere,
  successResponse,
  logActivity,
  withErrorHandling,
} from "@/lib/api/helpers";
import { auth } from "@/auth";

/* ---------------- SCHEMAS ---------------- */

const querySchema = z.object({
  page: z.string().default("1"),
  limit: z.string().default("10"),
  search: z.string().optional(),

  sortBy: z
    .enum(["createdAt", "name", "year", "startDate"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  status: z
    .enum([
      "DRAFT",
      "REGISTRATION",
      "UPCOMING",
      "ONGOING",
      "COMPLETED",
      "CANCELLED",
    ])
    .optional(),
});

const createTournamentSchema = z.object({
  name: z.string().min(3).max(150),
  year: z.number().int(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z
    .enum([
      "DRAFT",
      "REGISTRATION",
      "UPCOMING",
      "ONGOING",
      "COMPLETED",
      "CANCELLED",
    ])
    .optional(),
  description: z.string().max(500).optional(),
  sponsors: z.array(z.any()).max(20).optional(),
  info: z.array(z.any()).max(20).optional(),
  images: z.array(z.string().url()).max(10).optional(),
  // Remove games from here - it will be added via separate update endpoint
});

/* ---------------- HANDLERS ---------------- */

async function handleGet(request) {
  const setup = await setupApiHandler(request, "tournaments:list", {
    requireAuthentication: false,
  });
  if (setup.error) return setup.error;

  const { searchParams } = new URL(request.url);

  const validated = querySchema.parse({
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    search: searchParams.get("search") || undefined,
    sortBy: searchParams.get("sortBy") || undefined,
    status: searchParams.get("status") || undefined, // ✅ no longer crashes
    sortOrder: searchParams.get("sortOrder") || undefined,
  });

  const { page, limit, skip } = parsePagination(searchParams);

  // ✅ Search only on name, status filter applied separately
  const searchWhere = buildSearchWhere(validated.search, ["name"]);
  const where = {
    ...searchWhere,
    ...(validated.status && { status: validated.status }), // ✅ actually filters
  };

  const [tournaments, total] = await Promise.all([
    db.tournament.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [validated.sortBy]: validated.sortOrder },
      select: {
        // ✅ use select+_count instead of
        id: true, // loading all relations into memory
        name: true,
        year: true,
        startDate: true,
        endDate: true,
        status: true,
        description: true,
        images: true,
        createdAt: true,
        _count: {
          select: {
            participation: true,
            matches: true,
          },
        },
      },
    }),
    db.tournament.count({ where }),
  ]);

  return successResponse({
    tournaments,
    pagination: buildPaginationResponse(page, limit, total, tournaments),
  });
}

async function handlePost(request) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "tournaments:create");
  if (setup.error) return setup.error;

  const { user } = await auth();

  // Validate body
  const body = await request.json();
  const validated = createTournamentSchema.parse(body);

  // Create tournament (without games - those will be added separately)
  const tournament = await db.tournament.create({
    data: {
      name: validated.name,
      year: validated.year,
      startDate: new Date(validated.startDate),
      endDate: new Date(validated.endDate),
      status: validated.status || "DRAFT",
      description: validated.description,
      info: validated.info || [],
      images: validated.images || [],
      createdBy: {
        connect: { id: user.id },
      },
    },
    include: {
      games: true,
      participation: true,
      matches: true,
      placements: true,
    },
  });

  // Log activity
  await logActivity({
    userId: user.id,
    action: "created",
    entity: "tournament",
    entityId: tournament.id,
    entityName: tournament.name,
    description: `Created tournament "${tournament.name} ${tournament.year}"`,
    request,
  });

  return successResponse(tournament, "Tournament created successfully", 201);
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "tournaments");
export const POST = withErrorHandling(handlePost, "tournament");
