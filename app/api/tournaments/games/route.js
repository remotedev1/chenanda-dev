// app/api/tournament-games/route.js
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
  tournamentId: z.string().optional(),
  sportType: z
    .enum([
      "FOOTBALL",
      "BASKETBALL",
      "VOLLEYBALL",
      "CRICKET",
      "TENNIS",
      "BADMINTON",
      "ATHLETICS",
      "FIELD_HOCKEY",
      "TABLE_TENNIS",
      "KABADDI",
    ])
    .optional(),
  category: z
    .enum(["MENS", "WOMENS", "JUNIOR", "VETERANS", "MIXED"])
    .optional(),
  status: z.enum(["active", "inactive"]).optional(),
  sortBy: z
    .enum(["name", "date", "createdAt", "updatedAt", "sportType", "category"])
    .default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const createGameSchema = z.object({
  tournamentId: z.string().min(1, "Tournament is required"),
  sportType: z.string().min(1, "Sport type is required"),
  name: z
    .string()
    .min(2, "Game name must be at least 2 characters")
    .max(200, "Game name must be less than 200 characters"),
  format: z
    .string()
    .max(100, "Format must be less than 100 characters")
    .optional()
    .nullable(),
  category: z
    .enum(["MENS", "WOMENS", "JUNIOR", "VETERANS", "MIXED"], {
      required_error: "Category is required",
    }),
  date: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .or(z.date()),
  isActive: z.boolean().default(true),
  icon: z
    .string()
    .max(10, "Icon must be less than 10 characters")
    .optional()
    .nullable(),
  description: z
    .string()
    .max(2000, "Description must be less than 2000 characters")
    .optional()
    .nullable(),
  rules: z
    .string()
    .max(5000, "Rules must be less than 5000 characters")
    .optional()
    .nullable(),
});

/* ---------------- HANDLERS ---------------- */

async function handleGet(request) {
  const setup = await setupApiHandler(request, "tournament-games:list");
  if (setup.error) return setup.error;

  const { searchParams } = new URL(request.url);

  const validated = querySchema.parse({
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    search: searchParams.get("search") || undefined,
    tournamentId: searchParams.get("tournamentId") || undefined,
    sportType: searchParams.get("sportType") || undefined,
    category: searchParams.get("category") || undefined,
    status: searchParams.get("status") || undefined,
    sortBy: searchParams.get("sortBy") || undefined,
    sortOrder: searchParams.get("sortOrder") || undefined,
  });

  const { page, limit, skip } = parsePagination(searchParams);

  const where = {
    ...buildSearchWhere(validated.search, ["name", "description", "format"]),
    ...(validated.tournamentId && { tournamentId: validated.tournamentId }),
    ...(validated.sportType && { sportType: validated.sportType }),
    ...(validated.category && { category: validated.category }),
    ...(validated.status && { isActive: validated.status === "active" }),
  };

  const orderBy = (() => {
    const dir = validated.sortOrder;
    switch (validated.sortBy) {
      case "date":       return { date: dir };
      case "createdAt":  return { createdAt: dir };
      case "updatedAt":  return { updatedAt: dir };
      case "sportType":  return { sportType: dir };
      case "category":   return { category: dir };
      default:           return { name: dir };
    }
  })();

  const [games, total] = await Promise.all([
    db.tournamentGame.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
          },
        },
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
    ...buildPaginationResponse(page, limit, total, games),
  });
}

async function handlePost(request) {
  const setup = await setupApiHandler(request, "tournament-games:create");
  if (setup.error) return setup.error;

  const { user } = await auth();

  const ability = defineAbilityFor(user);
  if (!ability.can(ACTIONS.CREATE, RESOURCES.TOURNAMENT_GAME)) {
    return errorResponse(
      "You don't have permission to create tournament games",
      403
    );
  }

  const body = await request.json();
  const validated = createGameSchema.parse(body);

  // Verify tournament exists
  const tournament = await db.tournament.findUnique({
    where: { id: validated.tournamentId },
    select: { id: true, name: true },
  });

  if (!tournament) {
    return errorResponse("Selected tournament does not exist", 400);
  }

  // Check for duplicate game name in the same tournament
  const existing = await db.tournamentGame.findFirst({
    where: {
      name: validated.name,
      tournamentId: validated.tournamentId,
    },
  });

  if (existing) {
    return errorResponse(
      "A game with this name already exists in this tournament",
      409
    );
  }

  const game = await db.tournamentGame.create({
    data: {
      tournamentId: validated.tournamentId,
      sportType: validated.sportType,
      name: validated.name,
      format: validated.format || null,
      category: validated.category,
      date: validated.date,
      isActive: validated.isActive,
      icon: validated.icon || null,
      description: validated.description || null,
      rules: validated.rules || null,
    },
    include: {
      tournament: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          registrations: true,
          matches: true,
        },
      },
    },
  });

  await logActivity({
    userId: setup.user.userId,
    action: "created",
    entity: "tournament-game",
    entityId: game.id,
    entityName: game.name,
    description: `Created game "${game.name}" in tournament "${tournament.name}"`,
    request,
  });

  return successResponse(game, "Tournament game created successfully", 201);
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "tournament-games");
export const POST = withErrorHandling(handlePost, "tournament-game");