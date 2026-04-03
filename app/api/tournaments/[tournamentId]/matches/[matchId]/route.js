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

/* ---------------- SHARED ENUMS ---------------- */

const PERIOD_VALUES = [
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
];

const STATUS_VALUES = [
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
];

const VENUE_VALUES = [
  "GROUND_1",
  "GROUND_2",
  "GROUND_3",
  "GROUND_4",
  "GROUND_5",
  "GROUND_6",
  "GROUND_7",
  "GROUND_8",
  "MAIN_STADIUM",
];

const ROUND_VALUES = [
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
];

const dateField = z
  .string()
  .datetime()
  .transform((str) => new Date(str))
  .or(z.date());

/* ---------------- SCHEMAS ---------------- */

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
    "ADD_SHOOTOUT",
    "ADD_HOCKEY_GOAL",
    "DELETE_HOCKEY_GOAL",
    "DELETE_SHOOTOUT",
    "SET_WALKOVER",
  ]),
  period: z.enum(PERIOD_VALUES).optional(),
  status: z.enum(STATUS_VALUES).optional(),
  winnerId: z.string().optional().nullable(),
  winnerName: z.string().optional().nullable(),
  familyId: z.string().optional(),
  goal: z
    .object({
      minute: z.number().int().min(0),
      type: z
        .enum(["FIELD_GOAL", "PENALTY_CORNER", "PENALTY_STROKE"])
        .optional(),
      playerId: z.string().optional(),
      playerName: z.string().optional(),
      jerseyNumber: z.string().nullish(),
    })
    .optional(),
  scored: z.boolean().optional(),
  goalIndex: z.number().int().optional(),
  shootoutIndex: z.number().int().optional(),
  isDraw: z.boolean().optional(),
  manOfTheMatchId: z.string().optional().nullable(),
  note: z.string().max(2000).optional(),
});

/* ---------------- HANDLERS ---------------- */

async function handleGet(request, { params }) {
  const setup = await setupApiHandler(request, "matches:read");
  if (setup.error) return setup.error;

  const { matchId } = params;

  const match = await db.matches.findUnique({
    where: { id: matchId },
    include: {
      tournament: { select: { id: true, name: true, year: true } },
    },
  });

  if (!match) return errorResponse("Match not found", 404);

  return successResponse(match);
}

async function handlePatch(request, { params }) {
  const setup = await setupApiHandler(request, "matches:update");
  if (setup.error) return setup.error;
  const { user } = await auth();
  const { matchId } = params;
  const body = await request.json();
  const isLiveUpdate = body.action !== undefined;

  const existing = await db.matches.findUnique({
    where: { id: matchId },
    include: { tournament: { select: { name: true } } },
  });

  if (!existing) return errorResponse("Match not found", 404);

  const matchLabel = existing.name || `#${existing.matchNo}`;
  let updateData = {};
  let activityDescription = "";
  // ---- LIVE UPDATE ACTIONS ----
  const validated = liveUpdateSchema.parse(body);
  switch (validated.action) {
    case "START_MATCH":
      updateData = {
        status: "LIVE",
        actualStartTime: new Date(),
        currentPeriod: "WARM_UP",
      };
      activityDescription = `Started match "${matchLabel}"`;
      break;

    case "END_MATCH":
      updateData = {
        status: "COMPLETED",
        actualEndTime: new Date(),
        currentPeriod: "FULL_TIME",
      };
      activityDescription = `Ended match "${matchLabel}"`;
      break;

    case "SET_PERIOD":
      if (!validated.period)
        return errorResponse("period is required for SET_PERIOD action", 400);
      updateData = { currentPeriod: validated.period };
      activityDescription = `Set period to ${validated.period} for match "${matchLabel}"`;
      break;

    case "SET_STATUS":
      if (!validated.status)
        return errorResponse("status is required for SET_STATUS action", 400);
      updateData = { status: validated.status };
      if (validated.status === "LIVE" && !existing.actualStartTime) {
        updateData.actualStartTime = new Date();
      }
      if (
        ["COMPLETED", "ABANDONED", "WALKOVER"].includes(validated.status) &&
        !existing.actualEndTime
      ) {
        updateData.actualEndTime = new Date();
      }
      activityDescription = `Set status to ${validated.status} for match "${matchLabel}"`;
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
        ? `Match "${matchLabel}" set as draw`
        : `Set winner to "${validated.winnerName}" for match "${matchLabel}"`;
      break;

    case "SET_DRAW":
      updateData = { isDraw: true, winnerId: null, winnerName: null };
      activityDescription = `Match "${matchLabel}" set as draw`;
      break;

    case "SET_MAN_OF_MATCH":
      updateData = { manOfTheMatchId: validated.manOfTheMatchId || null };
      activityDescription = `Set man of the match for "${matchLabel}"`;
      break;

    case "ADD_NOTE":
      if (!validated.note)
        return errorResponse("note is required for ADD_NOTE action", 400);
      updateData = { notes: validated.note };
      activityDescription = `Added note to match "${matchLabel}"`;
      break;

    case "ADD_HOCKEY_GOAL": {
      if (!validated.familyId)
        return errorResponse(
          "familyId is required for ADD_HOCKEY_GOAL action",
          400,
        );
      if (!validated.goal)
        return errorResponse(
          "goal is required for ADD_HOCKEY_GOAL action",
          400,
        );

      const participantIndex = existing.participants.findIndex(
        (p) => p.familyId === validated.familyId,
      );
      if (participantIndex === -1)
        return errorResponse("Participant not found", 404);

      const participants = structuredClone(existing.participants);
      const participant = participants[participantIndex];

      if (!participant.hockeyData) {
        participant.hockeyData = {
          goals: 0,
          shootoutResults: [],
          goalDetails: [],
        };
      }
      if (!participant.hockeyData.goalDetails) {
        participant.hockeyData.goalDetails = [];
      }

      participant.hockeyData.goalDetails.push({
        minute: Number(validated.goal.minute),
        type: validated.goal.type ?? "FIELD_GOAL",
        playerId: validated.goal.playerId,
        playerName: validated.goal.playerName,
        jerseyNumber: validated.goal.jerseyNumber
          ? Number(validated.goal.jerseyNumber)
          : null,
      });

      participant.hockeyData.goals = participant.hockeyData.goalDetails.length;

      updateData = { participants };
      activityDescription = `${validated.goal.playerName} scored for ${participant.family} in "${matchLabel}"`;
      break;
    }

    case "DELETE_HOCKEY_GOAL": {
      if (!validated.familyId)
        return errorResponse(
          "familyId is required for DELETE_HOCKEY_GOAL action",
          400,
        );
      if (validated.goalIndex === undefined || validated.goalIndex === null)
        return errorResponse(
          "goalIndex is required for DELETE_HOCKEY_GOAL action",
          400,
        );

      const participantIndex = existing.participants.findIndex(
        (p) => p.familyId === validated.familyId,
      );
      if (participantIndex === -1)
        return errorResponse("Participant not found", 404);

      const participants = structuredClone(existing.participants);
      const participant = participants[participantIndex];

      const goals = participant.hockeyData?.goalDetails ?? [];
      if (validated.goalIndex < 0 || validated.goalIndex >= goals.length)
        return errorResponse("goalIndex out of range", 400);

      const removed = goals[validated.goalIndex];
      goals.splice(validated.goalIndex, 1);

      participant.hockeyData.goalDetails = goals;
      participant.hockeyData.goals = goals.length;

      updateData = { participants };
      activityDescription = `Deleted goal by ${removed.playerName} for ${participant.family} in "${matchLabel}"`;
      break;
    }

    case "ADD_SHOOTOUT": {
      if (!validated.familyId)
        return errorResponse(
          "familyId is required for ADD_SHOOTOUT action",
          400,
        );

      if (validated.scored === undefined || validated.scored === null)
        return errorResponse(
          "scored (boolean) is required for ADD_SHOOTOUT action",
          400,
        );

      const participantIndex = existing.participants.findIndex(
        (p) => p.familyId === validated.familyId,
      );
      if (participantIndex === -1)
        return errorResponse("Participant not found", 404);

      const participants = structuredClone(existing.participants);
      const participant = participants[participantIndex];

      if (!participant.hockeyData) {
        participant.hockeyData = {
          goals: 0,
          shootoutResults: [],
          goalDetails: [],
        };
      }
      if (!participant.hockeyData.shootoutResults) {
        participant.hockeyData.shootoutResults = [];
      }

      participant.hockeyData.shootoutResults.push(Boolean(validated.scored));

      updateData = {
        participants,
        currentPeriod: "PENALTY_SHOOTOUT",
        status: "LIVE",
      };
      activityDescription = `Penalty ${validated.scored ? "scored" : "missed"} by ${participant.family} in "${matchLabel}"`;
      break;
    }

    case "DELETE_SHOOTOUT": {
      console.log(validated);
      if (!validated.familyId)
        return errorResponse(
          "familyId is required for DELETE_SHOOTOUT action",
          400,
        );
      if (
        validated.shootoutIndex === undefined ||
        validated.shootoutIndex === null
      )
        return errorResponse(
          "shootoutIndex is required for DELETE_SHOOTOUT action",
          400,
        );

      const participantIndex = existing.participants.findIndex(
        (p) => p.familyId === validated.familyId,
      );
      if (participantIndex === -1)
        return errorResponse("Participant not found", 404);

      const participants = structuredClone(existing.participants);
      const participant = participants[participantIndex];

      const results = participant.hockeyData?.shootoutResults ?? [];
      if (
        validated.shootoutIndex < 0 ||
        validated.shootoutIndex >= results.length
      )
        return errorResponse("shootoutIndex out of range", 400);

      results.splice(validated.shootoutIndex, 1);
      participant.hockeyData.shootoutResults = results;

      updateData = { participants };
      activityDescription = `Removed penalty #${validated.shootoutIndex + 1} for ${participant.family} in "${matchLabel}"`;
      break;
    }

    case "SET_WALKOVER": {
      if (!validated.familyId)
        return errorResponse(
          "familyId is required for SET_WALKOVER action",
          400,
        );

      const participants = structuredClone(existing.participants);
      const winner = participants.find(
        (p) => p.familyId === validated.familyId,
      );
      if (!winner) return errorResponse("Participant not found", 404);

      participants.forEach((p) => {
        p.walkover = p.familyId === validated.familyId;
      });

      updateData = {
        participants,
        status: "WALKOVER",
        actualEndTime: new Date(),
        winnerId: validated.familyId,
        winnerName: winner.family,
        isDraw: false,
      };
      activityDescription = `Walkover awarded to ${winner.family} in "${matchLabel}"`;
      break;
    }

    default:
      return errorResponse("Invalid action", 400);
  }

  const match = await db.matches.update({
    where: { id: matchId },
    data: { ...updateData, updatedAt: new Date() },
  });

  await logActivity({
    userId: user.id,
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

  if (!match) return errorResponse("Match not found", 404);

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
