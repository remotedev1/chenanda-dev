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
  limit: z.string().default("10"),
  search: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "name", "year", "startDate"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
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
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "tournaments:list");
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

  // Search filter
  const where = buildSearchWhere(validated.search, ["name", "description"]);

  // Fetch data
  const [tournaments, total] = await Promise.all([
    db.tournament.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [validated.sortBy]: validated.sortOrder },
      include: {
        games: true,
        participation: true,
        matches: true,
        placements: true,
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

  const user = await auth();

  // Ability
  const ability = defineAbilityFor(user);

  if (!ability.can(ACTIONS.MANAGE, "all")) {
    return errorResponse(
      "You don't have permission to create tournaments",
      403
    );
  }

  // Validate body
  const body = await request.json();
  const validated = createTournamentSchema.parse(body);

  // Duplicate check (same name + year)
  const isDuplicate = await db.tournament.findFirst({
    where: {
      name: validated.name,
      year: validated.year,
    },
  });

  if (isDuplicate) {
    return errorResponse(
      "Tournament with this name and year already exists",
      409
    );
  }

  // Create tournament (without games - those will be added separately)
  const tournament = await db.tournament.create({
    data: {
      name: validated.name,
      year: validated.year,
      startDate: new Date(validated.startDate),
      endDate: new Date(validated.endDate),
      registrationDeadline: new Date(validated.registrationDeadline),
      status: validated.status || "DRAFT",
      description: validated.description,
      sponsors: validated.sponsors || [],
      info: validated.info || [],
      images: validated.images || [],
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
    userId: setup.user.userId,
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
