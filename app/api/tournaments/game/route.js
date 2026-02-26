import { z } from "zod";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  parsePagination,
  buildPaginationResponse,
  successResponse,
  errorResponse,
  logActivity,
  withErrorHandling,
} from "@/lib/api/helpers";
import { ACTIONS, defineAbilityFor } from "@/lib/ability";
import { auth } from "@/auth";

/* ---------------- SCHEMAS ---------------- */

const querySchema = z.object({
  page: z.string().default("1"),
  limit: z.string().default("10"),
  sportType: z.string().optional(),
  category: z.enum(["MENS", "WOMENS", "JUNIOR", "VETERANS", "MIXED"]).optional(),
  isActive: z.string().optional(),
  sortBy: z.enum(["date", "name", "createdAt"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

const createGameSchema = z.object({
  sportType: z.string().min(1, "Sport type is required"),
  name: z.string().min(3, "Game name must be at least 3 characters"),
  format: z.string().optional(),
  category: z.enum(["MENS", "WOMENS", "JUNIOR", "VETERANS", "MIXED"]),
  date: z.string().datetime(),
  registrationDeadline: z.string().datetime(),
  registrationFee: z.number().min(0, "Fee must be positive"),
  maxTeams: z.number().int().min(2).optional(),
  minTeams: z.number().int().min(2).optional(),
  isActive: z.boolean().default(true),
  icon: z.string().optional(),
  description: z.string().optional(),
  rules: z.string().optional(),
});

/* ---------------- HANDLERS ---------------- */

/* ========== GET GAMES ========== */

async function handleGet(request, { params }) {
  const setup = await setupApiHandler(request, "games:list");
  if (setup.error) return setup.error;

  const { id: tournamentId } = params;

  // Query params
  const { searchParams } = new URL(request.url);
  const validated = querySchema.parse({
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    sportType: searchParams.get("sportType") || undefined,
    category: searchParams.get("category") || undefined,
    isActive: searchParams.get("isActive") || undefined,
    sortBy: searchParams.get("sortBy") || undefined,
    sortOrder: searchParams.get("sortOrder") || undefined,
  });

  const { page, limit, skip } = parsePagination(searchParams);

  // Build where clause
  const where = {
    tournamentId,
    ...(validated.sportType && { sportType: validated.sportType }),
    ...(validated.category && { category: validated.category }),
    ...(validated.isActive && { isActive: validated.isActive === "true" }),
  };

  // Fetch games
  const [games, total] = await Promise.all([
    db.tournamentGame.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [validated.sortBy]: validated.sortOrder },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            year: true,
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
    games,
    pagination: buildPaginationResponse(page, limit, total, games),
  });
}

/* ========== CREATE GAME ========== */

async function handlePost(request, { params }) {
  const setup = await setupApiHandler(request, "games:create");
  if (setup.error) return setup.error;

  const user = await auth();
  const ability = defineAbilityFor(user);

  if (!ability.can(ACTIONS.MANAGE, "all")) {
    return errorResponse("You don't have permission to create games", 403);
  }

  const { id: tournamentId } = params;

  // Check if tournament exists
  const tournament = await db.tournament.findUnique({
    where: { id: tournamentId },
  });

  if (!tournament) {
    return errorResponse("Tournament not found", 404);
  }

  // Parse and validate body
  const body = await request.json();
  const validated = createGameSchema.parse(body);

  // Validate dates
  const gameDate = new Date(validated.date);
  const regDeadline = new Date(validated.registrationDeadline);
  const tournamentStart = new Date(tournament.startDate);
  const tournamentEnd = new Date(tournament.endDate);

  if (regDeadline >= gameDate) {
    return errorResponse(
      "Registration deadline must be before game date",
      400
    );
  }

  if (gameDate < tournamentStart || gameDate > tournamentEnd) {
    return errorResponse("Game date must be within tournament dates", 400);
  }

  // Validate min/max teams
  if (validated.minTeams && validated.maxTeams) {
    if (validated.minTeams > validated.maxTeams) {
      return errorResponse(
        "Minimum teams cannot exceed maximum teams",
        400
      );
    }
  }

  // Create game
  const game = await db.tournamentGame.create({
    data: {
      tournamentId,
      sportType: validated.sportType,
      name: validated.name,
      format: validated.format,
      category: validated.category,
      date: gameDate,
      registrationDeadline: regDeadline,
      registrationFee: validated.registrationFee,
      maxTeams: validated.maxTeams,
      minTeams: validated.minTeams,
      isActive: validated.isActive,
      icon: validated.icon,
      description: validated.description,
      rules: validated.rules,
    },
    include: {
      tournament: {
        select: {
          id: true,
          name: true,
          year: true,
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

  // Log activity
  await logActivity({
    userId: setup.user.userId,
    action: "created",
    entity: "game",
    entityId: game.id,
    entityName: game.name,
    description: `Created game "${game.name}" for ${tournament.name}`,
    request,
  });

  return successResponse(game, "Game created successfully", 201);
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "games");
export const POST = withErrorHandling(handlePost, "game");