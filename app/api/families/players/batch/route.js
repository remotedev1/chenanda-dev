// app/api/players/batch/route.js
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

const batchPlayerSchema = z.object({
  playerName: z
    .string()
    .min(2, "Player name must be at least 2 characters")
    .max(100, "Player name must be less than 100 characters"),
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
  jerseyNumber: z
    .string()
    .or(z.number())
    .transform((val) => {
      if (typeof val === "string") {
        const num = parseInt(val, 10);
        return isNaN(num) ? null : num;
      }
      return val;
    })
    .optional()
    .nullable(),
  position: z.string().optional().nullable(), // Add position field
  biography: z
    .string()
    .max(2000, "Biography must be less than 2000 characters")
    .optional()
    .nullable(),
  info: z.array(z.record(z.any())).optional().default([]),
  familyId: z.string().min(1, "Family is required"),
  isActive: z.boolean().default(true),
});

const batchCreateSchema = z.object({
  players: z
    .array(batchPlayerSchema)
    .min(1, "At least one player is required")
    .max(50, "Maximum 50 players can be created at once"),
});

/* ---------------- HANDLER ---------------- */

async function handlePost(request) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "players:batch-create", {
    requireAuthentication: false,
  });
  if (setup.error) return setup.error;

  // Validate body
  const body = await request.json();
  const validated = batchCreateSchema.parse(body);

  // Get unique family IDs from the batch
  const familyIds = [...new Set(validated.players.map((p) => p.familyId))];

  // Verify all families exist
  const families = await db.families.findMany({
    where: {
      id: { in: familyIds },
    },
    select: {
      id: true,
      familyName: true,
    },
  });

  const familiesMap = new Map(families.map((f) => [f.id, f]));

  // Validate all families exist
  for (const familyId of familyIds) {
    if (!familiesMap.has(familyId)) {
      return errorResponse(`Family with ID "${familyId}" does not exist`, 400);
    }
  }

  // Check for duplicate player names within the batch and in the database
  const playerNamesByFamily = new Map();

  for (const player of validated.players) {
    const key = `${player.familyId}:${player.playerName.toLowerCase().trim()}`;

    if (playerNamesByFamily.has(key)) {
      return errorResponse(
        `Duplicate player name "${player.playerName}" in the batch for the same family`,
        400,
      );
    }

    playerNamesByFamily.set(key, true);
  }

  // Check database for existing players with same names in their families
  const existingPlayers = await db.player.findMany({
    where: {
      OR: validated.players.map((p) => ({
        playerName: p.playerName,
        familyId: p.familyId,
      })),
    },
    select: {
      playerName: true,
      familyId: true,
      family: {
        select: {
          familyName: true,
        },
      },
    },
  });

  if (existingPlayers.length > 0) {
    const duplicates = existingPlayers.map(
      (p) => `"${p.playerName}" in ${p.family.familyName}`,
    );
    return errorResponse(
      `The following players already exist: ${duplicates.join(", ")}`,
      409,
    );
  }

  // Create all players in a transaction
  const createdPlayers = await db.$transaction(
    async (tx) => {
      const players = [];

      for (const playerData of validated.players) {
        // Store position in info array if provided
        const info = playerData.info || [];
        if (playerData.position) {
          info.push({ position: playerData.position });
        }

        const player = await tx.player.create({
          data: {
            playerName: playerData.playerName.trim(),
            dateOfBirth: playerData.dateOfBirth || null,
            primarySport: playerData.primarySport || null,
            jerseyNumber: playerData.jerseyNumber || null,
            biography: playerData.biography || null,
            info: info,
            familyId: playerData.familyId,
            isActive: playerData.isActive,
          },
          include: {
            family: {
              select: {
                id: true,
                familyName: true,
              },
            },
          },
        });

        players.push(player);
      }

      return players;
    },
    {
      maxWait: 10000, // 10 seconds
      timeout: 30000, // 30 seconds
    },
  );

  return successResponse(
    {
      players: createdPlayers,
      count: createdPlayers.length,
      familiesAffected: familyIds.length,
    },
    `Successfully created ${createdPlayers.length} player(s)`,
    201,
  );
}

/* ---------------- EXPORTS ---------------- */

export const POST = withErrorHandling(handlePost, "players-batch");
