// app/api/tournaments/[tournamentId]/games/[gameId]/route.js
import { z } from "zod";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  successResponse,
  errorResponse,
  logActivity,
  withErrorHandling,
} from "@/lib/api/helpers";
import { auth } from "@/auth";

/* ---------------- SCHEMAS ---------------- */

const updateGameSchema = z.object({
  sportType: z.string().min(1).max(200).optional(),
  name: z.string().min(1).max(200).optional(),
  format: z.string().max(200).optional().nullable(),
  category: z.string().min(1).optional(),
  date: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .or(z.date())
    .optional(),
  icon: z.string().max(200).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  rules: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

/* ---------------- HANDLERS ---------------- */

async function handleGet(request, { params }) {
  const setup = await setupApiHandler(request, "games:read");
  if (setup.error) return setup.error;

  const { tournamentId, gameId } = params;

  const game = await db.tournamentGame.findFirst({
    where: {
      id: gameId,
      tournamentId,
    },
    include: {
      tournament: {
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
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

async function handlePatch(request, { params }) {
  const setup = await setupApiHandler(request, "games:update");
  if (setup.error) return setup.error;

  const { user } = await auth();
  const { tournamentId, gameId } = params;

  const body = await request.json();
  const validated = updateGameSchema.parse(body);

  // Verify game exists and belongs to tournament
  const existingGame = await db.tournamentGame.findFirst({
    where: {
      id: gameId,
      tournamentId,
    },
    select: {
      id: true,
      name: true,
      tournament: { select: { id: true, name: true } },
    },
  });

  if (!existingGame) {
    return errorResponse("Game not found", 404);
  }

  // Check for duplicate name if name is being updated
  if (validated.name && validated.name !== existingGame.name) {
    const duplicateGame = await db.tournamentGame.findFirst({
      where: {
        tournamentId,
        name: validated.name,
        id: { not: gameId },
      },
    });

    if (duplicateGame) {
      return errorResponse(
        "A game with this name already exists in this tournament",
        409,
      );
    }
  }

  // Build update data - only include fields that were provided
  const updateData = {};
  if (validated.sportType !== undefined)
    updateData.sportType = validated.sportType;
  if (validated.name !== undefined) updateData.name = validated.name;
  if (validated.format !== undefined) updateData.format = validated.format;
  if (validated.category !== undefined)
    updateData.category = validated.category;
  if (validated.date !== undefined) updateData.date = validated.date;
  if (validated.icon !== undefined) updateData.icon = validated.icon;
  if (validated.description !== undefined)
    updateData.description = validated.description;
  if (validated.registrationFee !== undefined)
    updateData.registrationFee = validated.registrationFee;
  if (validated.registrationDeadline !== undefined)
    updateData.registrationDeadline = validated.registrationDeadline;
  if (validated.rules !== undefined) updateData.rules = validated.rules;
  if (validated.isActive !== undefined)
    updateData.isActive = validated.isActive;

  const updatedGame = await db.tournamentGame.update({
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
    userId: user.id,
    action: "updated",
    entity: "game",
    entityId: updatedGame.id,
    entityName: updatedGame.name,
    description: `Updated game "${updatedGame.name}" in tournament "${existingGame.tournament.name}"`,
    request,
  });

  return successResponse(updatedGame, "Game updated successfully");
}

async function handleDelete(request, { params }) {
  const setup = await setupApiHandler(request, "games:delete");
  if (setup.error) return setup.error;

  const { user } = await auth();
  const { tournamentId, gameId } = params;

  // Verify game exists and belongs to tournament
  const existingGame = await db.tournamentGame.findFirst({
    where: {
      id: gameId,
      tournamentId,
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

  if (!existingGame) {
    return errorResponse("Game not found", 404);
  }

  // Check if game has registrations or matches
  const hasRegistrations = existingGame._count.registrations > 0;
  const hasMatches = existingGame._count.matches > 0;

  if (hasRegistrations || hasMatches) {
    return errorResponse(
      `Cannot delete game with ${existingGame._count.registrations} registrations and ${existingGame._count.matches} matches. Please archive it instead by setting isActive to false.`,
      400,
    );
  }

  await db.tournamentGame.delete({
    where: { id: gameId },
  });

  await logActivity({
    userId: user.id,
    action: "deleted",
    entity: "game",
    entityId: existingGame.id,
    entityName: existingGame.name,
    description: `Deleted game "${existingGame.name}" from tournament "${existingGame.tournament.name}"`,
    request,
  });

  return successResponse({ id: gameId }, "Game deleted successfully");
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "game");
export const PATCH = withErrorHandling(handlePatch, "game");
export const DELETE = withErrorHandling(handleDelete, "game");
