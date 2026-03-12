// app/api/players/[id]/route.js
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

const updatePlayerSchema = z.object({
  playerName: z
    .string()
    .min(2, "Player name must be at least 2 characters")
    .max(100, "Player name must be less than 100 characters")
    .optional(),
  dateOfBirth: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .optional()
    .nullable()
    .or(z.date().optional().nullable()),
  primarySport: z
    .enum([
      "FOOTBALL",
      "BASKETBALL",
      "VOLLEYBALL",
      "CRICKET",
      "TENNIS",
      "BADMINTON",
      "ATHLETICS",
    ])
    .optional()
    .nullable(),
  jerseyNumber: z.number().int().min(0).max(999).optional().nullable(),
  biography: z
    .string()
    .max(2000, "Biography must be less than 2000 characters")
    .optional(),
  info: z.array(z.record(z.any())).optional(),
  familyId: z.string().optional(),
  isActive: z.boolean().optional(),
});

/* ---------------- HANDLERS ---------------- */

async function handleGet(request, { params }) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "players:read", {
    requireAuthentication: false,
  });
  if (setup.error) return setup.error;

  const { playerId } = params;
  console.log(playerId);

  // Fetch player with related data
  const player = await db.player.findUnique({
    where: { id: playerId },
    include: {
      family: {
        select: {
          id: true,
          familyName: true,
          colors: true,
          images: true,
        },
      },
      achievements: {
        select: {
          id: true,
          title: true,
          description: true,
          date: true,
          category: true,
        },
        orderBy: {
          date: "desc",
        },
      },
      manOfTheMatchIn: {
        select: {
          id: true,
          tournament: {
            select: {
              id: true,
              name: true,
              year: true,
            },
          },
          sport: {
            select: {
              id: true,
              name: true,
            },
          },
          date: true,
        },
        orderBy: {
          date: "desc",
        },
      },
      _count: {
        select: {
          achievements: true,
          manOfTheMatchIn: true,
        },
      },
    },
  });

  if (!player) {
    return errorResponse("Player not found", 404);
  }

  return successResponse(player);
}

async function handlePatch(request, { params }) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "players:update");
  if (setup.error) return setup.error;

  const { user } = await auth();
  const { playerId } = params;

  // Validate body
  const body = await request.json();
  const validated = updatePlayerSchema.parse(body);

  // Check if player exists
  const existing = await db.player.findUnique({
    where: { id: playerId },
    include: {
      family: {
        select: {
          familyName: true,
        },
      },
    },
  });

  if (!existing) {
    return errorResponse("Player not found", 404);
  }

  // If familyId is being changed, verify new family exists
  if (validated.familyId && validated.familyId !== existing.familyId) {
    const newFamily = await db.families.findUnique({
      where: { id: validated.familyId },
    });

    if (!newFamily) {
      return errorResponse("Selected family does not exist", 400);
    }
  }

  // Check for duplicate name (if name is being changed and family stays same or changes)
  if (validated.playerName && validated.playerName !== existing.playerName) {
    const targetFamilyId = validated.familyId || existing.familyId;

    const duplicate = await db.player.findFirst({
      where: {
        playerName: validated.playerName,
        familyId: targetFamilyId,
        id: { not: playerId },
      },
    });

    if (duplicate) {
      return errorResponse(
        "A player with this name already exists in this family",
        409,
      );
    }
  }

  // Build update data - only include fields that are provided
  const updateData = {
    ...(validated.playerName && { playerName: validated.playerName }),
    ...(validated.dateOfBirth !== undefined && {
      dateOfBirth: validated.dateOfBirth,
    }),
    ...(validated.primarySport !== undefined && {
      primarySport: validated.primarySport,
    }),
    ...(validated.jerseyNumber !== undefined && {
      jerseyNumber: validated.jerseyNumber,
    }),
    ...(validated.biography !== undefined && {
      biography: validated.biography,
    }),
    ...(validated.info !== undefined && {
      info: validated.info,
    }),
    ...(validated.familyId && { familyId: validated.familyId }),
    ...(validated.isActive !== undefined && { isActive: validated.isActive }),
    updatedAt: new Date(),
  };

  // Update player
  const player = await db.player.update({
    where: { id: playerId },
    data: updateData,
    include: {
      family: {
        select: {
          id: true,
          familyName: true,
        },
      },
    },
  });

  // Log activity
  await logActivity({
    userId: user.id,
    action: "updated",
    entity: "player",
    entityId: player.id,
    entityName: player.playerName,
    description: `Updated player "${player.playerName}"`,
    request,
  });

  return successResponse(player, "Player updated successfully");
}

async function handleDelete(request, { params }) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "players:delete");
  if (setup.error) return setup.error;

  const { user } = await auth();
  const { id: playerId } = params;

  // Check if player exists
  const player = await db.player.findUnique({
    where: { id: playerId },
    include: {
      family: {
        select: {
          familyName: true,
        },
      },
      _count: {
        select: {
          achievements: true,
          manOfTheMatchIn: true,
        },
      },
    },
  });

  if (!player) {
    return errorResponse("Player not found", 404);
  }

  // Check for associated data and prevent deletion if any exist
  const counts = player._count;
  const associations = [];

  if (counts.achievements > 0)
    associations.push(`${counts.achievements} achievement(s)`);
  if (counts.manOfTheMatchIn > 0)
    associations.push(`${counts.manOfTheMatchIn} man of the match award(s)`);

  if (associations.length > 0) {
    return errorResponse(
      `Cannot delete player. It is associated with ${associations.join(", ")}. Please remove the associations first.`,
      400,
    );
  }

  // Delete player
  await db.player.delete({
    where: { id: playerId },
  });

  // Log activity
  await logActivity({
    userId: user.id,
    action: "deleted",
    entity: "player",
    entityId: playerId,
    entityName: player.playerName,
    description: `Deleted player "${player.playerName}" from family "${player.family.familyName}"`,
    request,
  });

  return successResponse({ id: playerId }, "Player deleted successfully");
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "player");
export const PATCH = withErrorHandling(handlePatch, "player");
export const DELETE = withErrorHandling(handleDelete, "player");
