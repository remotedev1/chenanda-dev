// app/api/matches/[id]/route.js
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

const updateMatchSchema = z.object({
  sport: z.string().optional(),
  gameId: z.string().optional().nullable(),
  matchNo: z.number().int().min(1).optional(),
  name: z.string().max(200).optional().nullable(),
  venue: z
    .enum([
      "GROUND_1",
      "GROUND_2",
      "GROUND_3",
      "GROUND_4",
      "GROUND_5",
      "GROUND_6",
      "GROUND_7",
      "GROUND_8",
      "MAIN_STADIUM",
    ])
    .optional(),
  scheduledOn: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .or(z.date())
    .optional(),
  actualStartTime: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .or(z.date())
    .optional()
    .nullable(),
  actualEndTime: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .or(z.date())
    .optional()
    .nullable(),
  pool: z.enum(["A", "B", "C", "D", "E", "F", "G", "H"]).optional().nullable(),
  round: z
    .enum([
      "POOL_STAGE",
      "ROUND_1",
      "ROUND_2",
      "ROUND_3",
      "ROUND_4",
      "ROUND_5",
      "ROUND_6",
      "ROUND_OF_32",
      "ROUND_OF_16",
      "PRE_QUARTER",
      "QUARTER_FINAL",
      "SEMI_FINAL",
      "THIRD_PLACE",
      "FINAL",
    ])
    .optional(),
  currentPeriod: z
    .enum([
      "WARM_UP",
      "FULL_TIME",
      "FIRST_HALF",
      "HALF_TIME",
      "SECOND_HALF",
      "PENALTY_SHOOTOUT",
      "TIE_BREAKER",
      "EXTRA_TIME_FIRST",
      "EXTRA_TIME_SECOND",
      "FIRST_QUARTER",
      "SECOND_QUARTER",
      "THIRD_QUARTER",
      "FOURTH_QUARTER",
      "QUARTER_BREAK",
      "FIRST_INNINGS",
      "SECOND_INNINGS",
      "INNINGS_BREAK",
      "SUPER_OVER",
      "SET_1",
      "SET_2",
      "SET_3",
      "SET_4",
      "SET_5",
      "SET_BREAK",
    ])
    .optional()
    .nullable(),
  status: z
    .enum([
      "SCHEDULED",
      "DELAYED",
      "LIVE",
      "SUSPENDED",
      "COMPLETED",
      "POSTPONED",
      "CANCELLED",
      "ABANDONED",
      "WALKOVER",
      "NO_RESULT",
    ])
    .optional(),
  winnerId: z.string().optional().nullable(),
  winnerName: z.string().optional().nullable(),
  isDraw: z.boolean().optional(),
  manOfTheMatchId: z.string().optional().nullable(),
  nextMatchId: z.string().optional().nullable(),
  sponsor: z.string().max(200).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  images: z.array(z.string()).optional(),
});

/* ---------------- LIVE UPDATE SCHEMA ---------------- */
// Dedicated schema for live match control actions
export const liveUpdateSchema = z.object({
  action: z.enum([
    "START_MATCH",
    "END_MATCH",
    "SET_PERIOD",
    "SET_STATUS",
    "SET_WINNER",
    "SET_DRAW",
    "SET_MAN_OF_MATCH",
    "ADD_NOTE",
  ]),
  // Payload varies by action
  period: z
    .enum([
      "WARM_UP",
      "FULL_TIME",
      "FIRST_HALF",
      "HALF_TIME",
      "SECOND_HALF",
      "PENALTY_SHOOTOUT",
      "TIE_BREAKER",
      "EXTRA_TIME_FIRST",
      "EXTRA_TIME_SECOND",
      "FIRST_QUARTER",
      "SECOND_QUARTER",
      "THIRD_QUARTER",
      "FOURTH_QUARTER",
      "QUARTER_BREAK",
      "FIRST_INNINGS",
      "SECOND_INNINGS",
      "INNINGS_BREAK",
      "SUPER_OVER",
      "SET_1",
      "SET_2",
      "SET_3",
      "SET_4",
      "SET_5",
      "SET_BREAK",
    ])
    .optional(),
  status: z
    .enum([
      "SCHEDULED",
      "DELAYED",
      "LIVE",
      "SUSPENDED",
      "COMPLETED",
      "POSTPONED",
      "CANCELLED",
      "ABANDONED",
      "WALKOVER",
      "NO_RESULT",
    ])
    .optional(),
  winnerId: z.string().optional().nullable(),
  winnerName: z.string().optional().nullable(),
  isDraw: z.boolean().optional(),
  manOfTheMatchId: z.string().optional().nullable(),
  note: z.string().max(2000).optional(),
});

/* ---------------- HANDLERS ---------------- */

async function handleGet(request, { params }) {
  const setup = await setupApiHandler(request, "matches:read");
  if (setup.error) return setup.error;

  const { matcheId } = params;

  const match = await db.matches.findUnique({
    where: { id: matcheId },
    include: {
      tournament: { select: { id: true, name: true, year: true } },
      game: { select: { id: true, name: true, icon: true, category: true } },
     
    },
  });

  if (!match) {
    return errorResponse("Match not found", 404);
  }

  return successResponse(match);
}

async function handlePatch(request, { params }) {
  const setup = await setupApiHandler(request, "matches:update");
  if (setup.error) return setup.error;

  const { user } = await auth();
  const { id: matchId } = params;



  const body = await request.json();

  // Check if this is a live update action or a regular update
  const isLiveUpdate = body.action !== undefined;

  const existing = await db.matches.findUnique({
    where: { id: matchId },
    include: {
      tournament: { select: { name: true } },
    },
  });

  if (!existing) {
    return errorResponse("Match not found", 404);
  }

  let updateData = {};
  let activityDescription = "";

  if (isLiveUpdate) {
    // ---- LIVE UPDATE ACTIONS ----
    const validated = liveUpdateSchema.parse(body);

    switch (validated.action) {
      case "START_MATCH":
        updateData = {
          status: "LIVE",
          actualStartTime: new Date(),
          currentPeriod: "WARM_UP",
        };
        activityDescription = `Started match "${existing.name || `#${existing.matchNo}`}"`;
        break;

      case "END_MATCH":
        updateData = {
          status: "COMPLETED",
          actualEndTime: new Date(),
          currentPeriod: "FULL_TIME",
        };
        activityDescription = `Ended match "${existing.name || `#${existing.matchNo}`}"`;
        break;

      case "SET_PERIOD":
        if (!validated.period) {
          return errorResponse("period is required for SET_PERIOD action", 400);
        }
        updateData = { currentPeriod: validated.period };
        activityDescription = `Set period to ${validated.period} for match "${existing.name || `#${existing.matchNo}`}"`;
        break;

      case "SET_STATUS":
        if (!validated.status) {
          return errorResponse("status is required for SET_STATUS action", 400);
        }
        updateData = { status: validated.status };
        // Auto-set times based on status
        if (validated.status === "LIVE" && !existing.actualStartTime) {
          updateData.actualStartTime = new Date();
        }
        if (
          ["COMPLETED", "ABANDONED", "WALKOVER"].includes(validated.status) &&
          !existing.actualEndTime
        ) {
          updateData.actualEndTime = new Date();
        }
        activityDescription = `Set status to ${validated.status} for match "${existing.name || `#${existing.matchNo}`}"`;
        break;

      case "SET_WINNER":
        if (!validated.winnerId && !validated.isDraw) {
          return errorResponse(
            "winnerId or isDraw is required for SET_WINNER action",
            400,
          );
        }
        updateData = {
          winnerId: validated.winnerId || null,
          winnerName: validated.winnerName || null,
          isDraw: validated.isDraw || false,
        };
        activityDescription = validated.isDraw
          ? `Match "${existing.name || `#${existing.matchNo}`}" set as draw`
          : `Set winner to "${validated.winnerName}" for match "${existing.name || `#${existing.matchNo}`}"`;
        break;

      case "SET_DRAW":
        updateData = { isDraw: true, winnerId: null, winnerName: null };
        activityDescription = `Match "${existing.name || `#${existing.matchNo}`}" set as draw`;
        break;

      case "SET_MAN_OF_MATCH":
        updateData = {
          manOfTheMatchId: validated.manOfTheMatchId || null,
        };
        activityDescription = `Set man of the match for "${existing.name || `#${existing.matchNo}`}"`;
        break;

      case "ADD_NOTE":
        if (!validated.note) {
          return errorResponse("note is required for ADD_NOTE action", 400);
        }
        updateData = { notes: validated.note };
        activityDescription = `Added note to match "${existing.name || `#${existing.matchNo}`}"`;
        break;

      default:
        return errorResponse("Invalid action", 400);
    }
  } else {
    // ---- REGULAR FULL UPDATE ----
    const validated = updateMatchSchema.parse(body);

    // Check unique constraint if matchNo or sport is changing
    if (
      (validated.matchNo && validated.matchNo !== existing.matchNo) ||
      (validated.sport && validated.sport !== existing.sport)
    ) {
      const duplicate = await db.matches.findFirst({
        where: {
          tournamentId: existing.tournamentId,
          sport: validated.sport || existing.sport,
          matchNo: validated.matchNo || existing.matchNo,
          id: { not: matchId },
        },
      });
      if (duplicate) {
        return errorResponse(
          `Match #${validated.matchNo || existing.matchNo} already exists for ${validated.sport || existing.sport} in this tournament`,
          409,
        );
      }
    }

    updateData = {
      ...(validated.sport !== undefined && { sport: validated.sport }),
      ...(validated.gameId !== undefined && { gameId: validated.gameId }),
      ...(validated.matchNo !== undefined && { matchNo: validated.matchNo }),
      ...(validated.name !== undefined && { name: validated.name }),
      ...(validated.venue !== undefined && { venue: validated.venue }),
      ...(validated.scheduledOn !== undefined && {
        scheduledOn: validated.scheduledOn,
      }),
      ...(validated.actualStartTime !== undefined && {
        actualStartTime: validated.actualStartTime,
      }),
      ...(validated.actualEndTime !== undefined && {
        actualEndTime: validated.actualEndTime,
      }),
      ...(validated.pool !== undefined && { pool: validated.pool }),
      ...(validated.round !== undefined && { round: validated.round }),
      ...(validated.currentPeriod !== undefined && {
        currentPeriod: validated.currentPeriod,
      }),
      ...(validated.status !== undefined && { status: validated.status }),
      ...(validated.winnerId !== undefined && { winnerId: validated.winnerId }),
      ...(validated.winnerName !== undefined && {
        winnerName: validated.winnerName,
      }),
      ...(validated.isDraw !== undefined && { isDraw: validated.isDraw }),
      ...(validated.manOfTheMatchId !== undefined && {
        manOfTheMatchId: validated.manOfTheMatchId,
      }),
      ...(validated.nextMatchId !== undefined && {
        nextMatchId: validated.nextMatchId,
      }),
      ...(validated.sponsor !== undefined && { sponsor: validated.sponsor }),
      ...(validated.notes !== undefined && { notes: validated.notes }),
      ...(validated.images !== undefined && { images: validated.images }),
      updatedAt: new Date(),
    };
    activityDescription = `Updated match "${existing.name || `#${existing.matchNo}`}"`;
  }

  const match = await db.matches.update({
    where: { id: matchId },
    data: { ...updateData, updatedAt: new Date() },
    include: {
      tournament: { select: { id: true, name: true } },
      game: { select: { id: true, name: true, icon: true } },
      participants: {
        include: {
          team: { select: { id: true, familyName: true, colors: true } },
        },
      },
      manOfTheMatch: { select: { id: true, playerName: true } },
    },
  });

  await logActivity({
    userId: setup.user.userId,
    action: isLiveUpdate ? body.action.toLowerCase() : "updated",
    entity: "match",
    entityId: match.id,
    entityName: match.name || `Match #${match.matchNo}`,
    description: activityDescription,
    request,
  });

  return successResponse(match, "Match updated successfully");
}

async function handleDelete(request, { params }) {
  const setup = await setupApiHandler(request, "matches:delete");
  if (setup.error) return setup.error;

  const { user } = await auth();
  const { id: matchId } = params;



  const match = await db.matches.findUnique({
    where: { id: matchId },
    include: {
      tournament: { select: { name: true } },
      _count: { select: { participants: true } },
    },
  });

  if (!match) {
    return errorResponse("Match not found", 404);
  }

  // Prevent deletion of live or completed matches
  if (["LIVE", "COMPLETED"].includes(match.status)) {
    return errorResponse(
      `Cannot delete a match that is ${match.status.toLowerCase()}. Please cancel or abandon it first.`,
      400,
    );
  }

  await db.matches.delete({ where: { id: matchId } });

  await logActivity({
    userId: setup.user.userId,
    action: "deleted",
    entity: "match",
    entityId: matchId,
    entityName: match.name || `Match #${match.matchNo}`,
    description: `Deleted ${match.sport} Match #${match.matchNo} from tournament "${match.tournament.name}"`,
    request,
  });

  return successResponse({ id: matchId }, "Match deleted successfully");
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "match");
export const PATCH = withErrorHandling(handlePatch, "match");
export const DELETE = withErrorHandling(handleDelete, "match");
