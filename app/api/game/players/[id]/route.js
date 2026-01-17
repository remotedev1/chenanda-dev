import { z } from "zod";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  successResponse,
  errorResponse,
  logActivity,
  withErrorHandling,
} from "@/lib/api/helpers";
import { defineAbilityFor } from "@/lib/ability";

/* ---------------- ENUM ---------------- */

const SportTypeEnum = z.enum([
  "FIELD_HOCKEY",
  "FOOTBALL",
  "CRICKET",
  "RELAY",
  "KABADDI",
  "ATHLETICS",
  "TENNIS",
  "OTHER",
]);

/* ---------------- SCHEMA ---------------- */

const updatePlayerSchema = z.object({
  playerName: z.string().min(2).optional(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  primarySport: SportTypeEnum.optional().nullable(),
  jerseyNumber: z.number().int().positive().optional().nullable(),
  biography: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  familyId: z.string().optional(),
});

/* ---------------- HANDLERS ---------------- */

async function handleGet(request, { params }) {
  const setup = await setupApiHandler(request, "players:get");
  if (setup.error) return setup.error;

  const ability = defineAbilityFor(setup.user);
  if (!ability.can("read", "Player")) {
    return errorResponse("You don't have permission to view players", 403);
  }

  const { id } = params;

  const player = await db.player.findUnique({
    where: { id },
    include: {
      family: {
        select: {
          id: true,
          familyName: true,
          shortName: true,
          colors: true,
        },
      },
      achievements: true,
    },
  });

  if (!player) {
    return errorResponse("Player not found", 404);
  }

  return successResponse(player);
}

async function handlePatch(request, { params }) {
  const setup = await setupApiHandler(request, "players:update");
  if (setup.error) return setup.error;

  const ability = defineAbilityFor(setup.user);
  if (!ability.can("update", "Player")) {
    return errorResponse("You don't have permission to update players", 403);
  }

  const { id } = params;

  const existingPlayer = await db.player.findUnique({
    where: { id },
  });

  if (!existingPlayer) {
    return errorResponse("Player not found", 404);
  }

  const body = await request.json();
  const validated = updatePlayerSchema.parse(body);

  if (validated.familyId) {
    const family = await db.families.findUnique({
      where: { id: validated.familyId },
    });

    if (!family) {
      return errorResponse("Family not found", 404);
    }
  }

  const updatedPlayer = await db.player.update({
    where: { id },
    data: {
      ...(validated.playerName && { playerName: validated.playerName }),
      ...(validated.dateOfBirth !== undefined && {
        dateOfBirth: validated.dateOfBirth
          ? new Date(validated.dateOfBirth)
          : null,
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
      ...(validated.isActive !== undefined && { isActive: validated.isActive }),
      ...(validated.familyId && { familyId: validated.familyId }),
    },
    include: {
      family: {
        select: {
          id: true,
          familyName: true,
          shortName: true,
        },
      },
    },
  });

  await logActivity({
    userId: setup.user.userId,
    action: "updated",
    entity: "player",
    entityId: updatedPlayer.id,
    entityName: updatedPlayer.playerName,
    description: `Updated player "${updatedPlayer.playerName}"`,
    request,
  });

  return successResponse(updatedPlayer, "Player updated successfully");
}

async function handleDelete(request, { params }) {
  const setup = await setupApiHandler(request, "players:delete");
  if (setup.error) return setup.error;

  const ability = defineAbilityFor(setup.user);
  if (!ability.can("delete", "Player")) {
    return errorResponse("You don't have permission to delete players", 403);
  }

  const { id } = params;

  const player = await db.player.findUnique({
    where: { id },
  });

  if (!player) {
    return errorResponse("Player not found", 404);
  }

  // Soft delete → mark inactive
  const deletedPlayer = await db.player.update({
    where: { id },
    data: { isActive: false },
  });

  await logActivity({
    userId: setup.user.userId,
    action: "deactivated",
    entity: "player",
    entityId: deletedPlayer.id,
    entityName: deletedPlayer.playerName,
    description: `Deactivated player "${deletedPlayer.playerName}"`,
    request,
  });

  return successResponse(deletedPlayer, "Player deactivated successfully");
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "player");
export const PATCH = withErrorHandling(handlePatch, "player");
export const DELETE = withErrorHandling(handleDelete, "player");
