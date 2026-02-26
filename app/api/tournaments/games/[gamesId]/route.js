// app/api/tournament-games/[id]/route.js
import { z } from "zod";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  successResponse,
  errorResponse,
  logActivity,
  withErrorHandling,
} from "@/lib/api/helpers";
import { ACTIONS, defineAbilityFor, RESOURCES } from "@/lib/ability";
import { auth } from "@/auth";

/* ---------------- SCHEMAS ---------------- */

const updateGameSchema = z.object({
  sportType: z.string().optional(),
  name: z
    .string()
    .min(2, "Game name must be at least 2 characters")
    .max(200, "Game name must be less than 200 characters")
    .optional(),
  format: z
    .string()
    .max(100, "Format must be less than 100 characters")
    .optional()
    .nullable(),
  category: z
    .enum(["MENS", "WOMENS", "JUNIOR", "VETERANS", "MIXED"])
    .optional(),
  date: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .or(z.date())
    .optional(),
  isActive: z.boolean().optional(),
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

async function handleGet(request, { params }) {
  const setup = await setupApiHandler(request, "tournament-games:read");
  if (setup.error) return setup.error;

  const { id } = params;

  const game = await db.tournamentGame.findUnique({
    where: { id },
    include: {
      tournament: {
        select: {
          id: true,
          name: true,
          year: true,
        },
      },
      registrations: {
        select: {
          id: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      matches: {
        select: {
          id: true,
          date: true,
        },
        orderBy: { date: "desc" },
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
    return errorResponse("Tournament game not found", 404);
  }

  return successResponse(game);
}

async function handlePatch(request, { params }) {
  const setup = await setupApiHandler(request, "tournament-games:update");
  if (setup.error) return setup.error;

  const { user } = await auth();
  const { id: gameId } = params;

  const ability = defineAbilityFor(user);
  if (!ability.can(ACTIONS.UPDATE, RESOURCES.TOURNAMENT_GAME)) {
    return errorResponse(
      "You don't have permission to update tournament games",
      403
    );
  }

  const body = await request.json();
  const validated = updateGameSchema.parse(body);

  // Check game exists
  const existing = await db.tournamentGame.findUnique({
    where: { id: gameId },
    include: {
      tournament: {
        select: { id: true, name: true },
      },
    },
  });

  if (!existing) {
    return errorResponse("Tournament game not found", 404);
  }

  // Check for duplicate name within the same tournament (if name is changing)
  if (validated.name && validated.name !== existing.name) {
    const duplicate = await db.tournamentGame.findFirst({
      where: {
        name: validated.name,
        tournamentId: existing.tournamentId,
        id: { not: gameId },
      },
    });

    if (duplicate) {
      return errorResponse(
        "A game with this name already exists in this tournament",
        409
      );
    }
  }

  const updateData = {
    ...(validated.sportType !== undefined && { sportType: validated.sportType }),
    ...(validated.name !== undefined && { name: validated.name }),
    ...(validated.format !== undefined && { format: validated.format }),
    ...(validated.category !== undefined && { category: validated.category }),
    ...(validated.date !== undefined && { date: validated.date }),
    ...(validated.isActive !== undefined && { isActive: validated.isActive }),
    ...(validated.icon !== undefined && { icon: validated.icon }),
    ...(validated.description !== undefined && { description: validated.description }),
    ...(validated.rules !== undefined && { rules: validated.rules }),
    updatedAt: new Date(),
  };

  const game = await db.tournamentGame.update({
    where: { id: gameId },
    data: updateData,
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
    action: "updated",
    entity: "tournament-game",
    entityId: game.id,
    entityName: game.name,
    description: `Updated game "${game.name}" in tournament "${existing.tournament.name}"`,
    request,
  });

  return successResponse(game, "Tournament game updated successfully");
}

async function handleDelete(request, { params }) {
  const setup = await setupApiHandler(request, "tournament-games:delete");
  if (setup.error) return setup.error;

  const { user } = await auth();
  const { id: gameId } = params;

  const ability = defineAbilityFor(user);
  if (!ability.can(ACTIONS.DELETE, RESOURCES.TOURNAMENT_GAME)) {
    return errorResponse(
      "You don't have permission to delete tournament games",
      403
    );
  }

  // Check game exists with association counts
  const game = await db.tournamentGame.findUnique({
    where: { id: gameId },
    include: {
      tournament: {
        select: { name: true },
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
    return errorResponse("Tournament game not found", 404);
  }

  // Block deletion if associations exist
  const associations = [];
  if (game._count.registrations > 0)
    associations.push(`${game._count.registrations} registration(s)`);
  if (game._count.matches > 0)
    associations.push(`${game._count.matches} match(es)`);

  if (associations.length > 0) {
    return errorResponse(
      `Cannot delete game. It is associated with ${associations.join(", ")}. Please remove the associations first.`,
      400
    );
  }

  await db.tournamentGame.delete({ where: { id: gameId } });

  await logActivity({
    userId: setup.user.userId,
    action: "deleted",
    entity: "tournament-game",
    entityId: gameId,
    entityName: game.name,
    description: `Deleted game "${game.name}" from tournament "${game.tournament.name}"`,
    request,
  });

  return successResponse({ id: gameId }, "Tournament game deleted successfully");
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "tournament-game");
export const PATCH = withErrorHandling(handlePatch, "tournament-game");
export const DELETE = withErrorHandling(handleDelete, "tournament-game");