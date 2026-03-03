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
import { auth } from "@/auth";

/* ---------------- SCHEMAS ---------------- */

const querySchema = z.object({
  page: z.string().default("1"),
  limit: z.string().default("10"),
  search: z.string().optional(),
  sportType: z.string().optional(),
  category: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) =>
      val === "true" ? true : val === "false" ? false : undefined,
    ),
  sortBy: z
    .enum(["date", "name", "sportType", "category", "createdAt", "updatedAt"])
    .default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

const createGameSchema = z.object({
  sportType: z.string().min(1, "Sport type is required"),
  name: z.string().min(1, "Game name is required").max(200),
  format: z.string().max(200).optional().nullable(),
  category: z.string().min(1, "Category is required"),
  date: z.coerce.date(),
  icon: z.string().max(200).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  registrationFee: z.number().min(0),
  registrationDeadline: z.coerce.date(),
  rules: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

/* ---------------- HANDLERS ---------------- */

async function handleGet(request, { params }) {
  const setup = await setupApiHandler(request, "games:list", {
    requireAuthentication: false,
  });
  if (setup.error) return setup.error;

  const { tournamentId } = params;
  const { searchParams } = new URL(request.url);

  const validated = querySchema.parse({
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    search: searchParams.get("search") || undefined,
    sportType: searchParams.get("sportType") || undefined,
    category: searchParams.get("category") || undefined,
    isActive: searchParams.get("isActive") || undefined,
    sortBy: searchParams.get("sortBy") || undefined,
    sortOrder: searchParams.get("sortOrder") || undefined,
  });

  const { page, limit, skip } = parsePagination(searchParams);

  // Verify tournament exists
  const tournament = await db.tournament.findUnique({
    where: { id: tournamentId },
    select: { id: true, name: true, startDate: true, endDate: true },
  });

  if (!tournament) {
    return errorResponse("Tournament not found", 404);
  }

  const where = {
    tournamentId,
    ...buildSearchWhere(validated.search, ["name", "description", "sportType"]),
    ...(validated.sportType && { sportType: validated.sportType }),
    ...(validated.category && { category: validated.category }),
    ...(validated.isActive !== undefined && { isActive: validated.isActive }),
  };

  const orderBy = (() => {
    const dir = validated.sortOrder;
    switch (validated.sortBy) {
      case "name":
        return { name: dir };
      case "sportType":
        return { sportType: dir };
      case "category":
        return { category: dir };
      case "createdAt":
        return { createdAt: dir };
      case "updatedAt":
        return { updatedAt: dir };
      default:
        return { date: dir };
    }
  })();

  const [games, total] = await Promise.all([
    db.tournamentGame.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        _count: {
          select: {
            registrations: true,
            matches: true,
          },
        },
      },
    }),
    db.tournamentGame.count({ where }),
  ]);

  return successResponse({
    data: games,
    tournament,
    ...buildPaginationResponse(page, limit, total, games),
  });
}

async function handlePost(request, { params }) {
  const setup = await setupApiHandler(request, "games:create", {
    requireAuthentication: false,
  });
  if (setup.error) return setup.error;

  const { user } = await auth();
  const { tournamentId } = params;

  const body = await request.json();

  const validated = createGameSchema.parse(body);
  console.log(validated);

  // Verify tournament exists
  const tournament = await db.tournament.findUnique({
    where: { id: tournamentId },
    select: { id: true, name: true },
  });

  if (!tournament) {
    return errorResponse("Tournament not found", 404);
  }

  // Check for duplicate game name in tournament
  const existingGame = await db.tournamentGame.findFirst({
    where: {
      tournamentId,
      name: validated.name,
    },
  });

  if (existingGame) {
    return errorResponse(
      "A game with this name already exists in this tournament",
      409,
    );
  }

  const game = await db.tournamentGame.create({
    data: {
      tournament: {
        connect: { id: tournamentId },
      },
      sportType: validated.sportType,
      name: validated.name,
      format: validated.format || null,
      category: validated.category,
      date: validated.date,
      icon: validated.icon || null,
      description: validated.description || null,
      registrationFee: validated.registrationFee,
      registrationDeadline: validated.registrationDeadline,
      rules: validated.rules || null,
      isActive: validated.isActive,
    },
    include: {
      _count: {
        select: {
          registrations: true,
          matches: true,
        },
      },
    },
  });

  await logActivity({
    userId: user.id,
    action: "created",
    entity: "game",
    entityId: game.id,
    entityName: game.name,
    description: `Created game "${game.name}" (${game.sportType}) in tournament "${tournament.name}"`,
    request,
  });

  return successResponse(game, "Game created successfully", 201);
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "games");
export const POST = withErrorHandling(handlePost, "game");
