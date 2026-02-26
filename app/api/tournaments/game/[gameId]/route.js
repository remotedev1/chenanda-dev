import { z } from "zod";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  successResponse,
  errorResponse,
  logActivity,
  withErrorHandling,
} from "@/lib/api/helpers";
import { ACTIONS, defineAbilityFor } from "@/lib/ability";
import { auth } from "@/auth";

/* ---------------- SCHEMAS ---------------- */

const updateGameSchema = z.object({
  sportType: z.string().optional(),
  name: z.string().min(3).optional(),
  format: z.string().optional(),
  category: z.enum(["MENS", "WOMENS", "JUNIOR", "VETERANS", "MIXED"]).optional(),
  date: z.string().datetime().optional(),
  registrationDeadline: z.string().datetime().optional(),
  registrationFee: z.number().min(0).optional(),
  maxTeams: z.number().int().min(2).optional().nullable(),
  minTeams: z.number().int().min(2).optional().nullable(),
  isActive: z.boolean().optional(),
  icon: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  rules: z.string().optional().nullable(),
});

/* ---------------- HANDLERS ---------------- */

/* ========== GET SINGLE GAME ========== */

async function handleGet(request, { params }) {
  const setup = await setupApiHandler(request, "games:get");
  if (setup.error) return setup.error;

  const { gameId } = params;

  const game = await db.tournamentGame.findUnique({
    where: { id: gameId },
    include: {
      tournament: {
        select: {
          id: true,
          name: true,
          year: true,
          startDate: true,
          endDate: true,
        },
      },
      registrations: {
        include: {
          family: {
            select: {
              id: true,
              familyName: true,
              shortName: true,
              images: true,
            },
          },
        },
      },
      matches: {
        select: {
          id: true,
          matchNo: true,
          status: true,
          scheduledOn: true,
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

  if (!game) {
    return errorResponse("Game not found", 404);
  }

  return successResponse(game);
}

/* ========== UPDATE GAME ========== */

async function handlePatch(request, { params }) {
  const setup = await setupApiHandler(request, "games:update");
  if (setup.error) return setup.error;

  const user = await auth();
  const ability = defineAbilityFor(user);

  if (!ability.can(ACTIONS.MANAGE, "all")) {
    return errorResponse("You don't have permission to update games", 403);
  }

  const { gameId } = params;

  const existingGame = await db.tournamentGame.findUnique({
    where: { id: gameId },
    include: {
      tournament: true,
      _count: {
        select: {
          registrations: true,
          matches: true,
        },
      },
    },
  });

  if (!existingGame) {
    return errorResponse("Game not found", 404);
  }

  const body = await request.json();
  const validated = updateGameSchema.parse(body);

  // Date validation
  if (validated.date || validated.registrationDeadline) {
    const gameDate = validated.date
      ? new Date(validated.date)
      : existingGame.date;
    const regDeadline = validated.registrationDeadline
      ? new Date(validated.registrationDeadline)
      : existingGame.registrationDeadline;

    if (regDeadline >= gameDate) {
      return errorResponse(
        "Registration deadline must be before game date",
        400
      );
    }

    // Check tournament date boundaries
    const tournamentStart = new Date(existingGame.tournament.startDate);
    const tournamentEnd = new Date(existingGame.tournament.endDate);

    if (gameDate < tournamentStart || gameDate > tournamentEnd) {
      return errorResponse("Game date must be within tournament dates", 400);
    }
  }

  // Validate min/max teams
  if (validated.minTeams !== undefined || validated.maxTeams !== undefined) {
    const minTeams = validated.minTeams ?? existingGame.minTeams;
    const maxTeams = validated.maxTeams ?? existingGame.maxTeams;

    if (minTeams && maxTeams && minTeams > maxTeams) {
      return errorResponse(
        "Minimum teams cannot exceed maximum teams",
        400
      );
    }
  }

  // Update game
  const updatedGame = await db.tournamentGame.update({
    where: { id: gameId },
    data: {
      ...(validated.sportType && { sportType: validated.sportType }),
      ...(validated.name && { name: validated.name }),
      ...(validated.format !== undefined && { format: validated.format }),
      ...(validated.category && { category: validated.category }),
      ...(validated.date && { date: new Date(validated.date) }),
      ...(validated.registrationDeadline && {
        registrationDeadline: new Date(validated.registrationDeadline),
      }),
      ...(validated.registrationFee !== undefined && {
        registrationFee: validated.registrationFee,
      }),
      ...(validated.maxTeams !== undefined && { maxTeams: validated.maxTeams }),
      ...(validated.minTeams !== undefined && { minTeams: validated.minTeams }),
      ...(validated.isActive !== undefined && { isActive: validated.isActive }),
      ...(validated.icon !== undefined && { icon: validated.icon }),
      ...(validated.description !== undefined && {
        description: validated.description,
      }),
      ...(validated.rules !== undefined && { rules: validated.rules }),
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
    action: "updated",
    entity: "game",
    entityId: updatedGame.id,
    entityName: updatedGame.name,
    description: `Updated game "${updatedGame.name}"`,
    request,
  });

  return successResponse(updatedGame, "Game updated successfully");
}

/* ========== DELETE GAME (SOFT) ========== */

async function handleDelete(request, { params }) {
  const setup = await setupApiHandler(request, "games:delete");
  if (setup.error) return setup.error;

  const user = await auth();
  const ability = defineAbilityFor(user);

  if (!ability.can(ACTIONS.MANAGE, "all")) {
    return errorResponse("You don't have permission to delete games", 403);
  }

  const { gameId } = params;

  const game = await db.tournamentGame.findUnique({
    where: { id: gameId },
    include: {
      _count: {
        select: {
          registrations: true,
          matches: true,
        },
      },
    },
  });

  if (!game) {
    return errorResponse("Game not found", 404);
  }

  const hasData =
    game._count.registrations > 0 || game._count.matches > 0;

  // Soft delete if game has data
  if (hasData) {
    const deactivatedGame = await db.tournamentGame.update({
      where: { id: gameId },
      data: { isActive: false },
    });

    await logActivity({
      userId: setup.user.userId,
      action: "deactivated",
      entity: "game",
      entityId: deactivatedGame.id,
      entityName: deactivatedGame.name,
      description: `Deactivated game "${deactivatedGame.name}" (has registrations or matches)`,
      request,
    });

    return successResponse(
      deactivatedGame,
      "Game has data and was marked as inactive"
    );
  }

  // Hard delete if no relations
  await db.tournamentGame.delete({ where: { id: gameId } });

  await logActivity({
    userId: setup.user.userId,
    action: "deleted",
    entity: "game",
    entityId: gameId,
    entityName: game.name,
    description: `Deleted game "${game.name}"`,
    request,
  });

  return successResponse(null, "Game deleted successfully");
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "game");
export const PATCH = withErrorHandling(handlePatch, "game");
export const DELETE = withErrorHandling(handleDelete, "game");