// app/api/matches/bulk/route.js
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

/* ---------------- SCHEMA ---------------- */

const bulkMatchSchema = z.object({
  matches: z
    .array(
      z.object({
        tournamentId: z.string().min(1, "Tournament is required"),
        sport: z.string().min(1, "Sport is required"),
        name: z.string().max(200).optional().nullable(),
        venue: z.enum([
          "GROUND_1",
          "GROUND_2",
          "GROUND_3",
          "GROUND_4",
          "GROUND_5",
          "GROUND_6",
          "GROUND_7",
          "GROUND_8",
          "MAIN_STADIUM",
        ]),
        gameId: z.string().min(1, "Please select a game"),

        scheduledOn: z
          .string()
          .datetime()
          .transform((str) => new Date(str))
          .or(z.date()),
        pool: z
          .enum(["A", "B", "C", "D", "E", "F", "G", "H"])
          .optional()
          .nullable(),
        round: z.enum([
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
        ]),
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
          .default("SCHEDULED"),
        participants: z
          .array(
            z.object({
              teamId: z.string().optional(),
              teamName: z.string().optional(),
            }),
          )
          .length(2),
      }),
    )
    .min(1, "At least one match is required")
    .max(100, "Cannot create more than 100 matches at once"),
});

/* ---------------- HANDLER ---------------- */

async function handlePost(request) {
  const setup = await setupApiHandler(request, "matches:bulk-create");
  if (setup.error) return setup.error;

  const { user } = await auth();

  const body = await request.json();

  const parsed = bulkMatchSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.flatten(), 400);
  }

  const { matches } = parsed.data;

  // Verify all tournamentIds exist (deduplicated)
  const tournamentIds = [...new Set(matches.map((m) => m.tournamentId))];
  const tournaments = await db.tournament.findMany({
    where: { id: { in: tournamentIds } },
    select: { id: true, name: true },
  });

  if (tournaments.length !== tournamentIds.length) {
    const foundIds = new Set(tournaments.map((t) => t.id));
    const missing = tournamentIds.filter((id) => !foundIds.has(id));
    return errorResponse(`Tournament(s) not found: ${missing.join(", ")}`, 400);
  }

  const tournamentMap = Object.fromEntries(tournaments.map((t) => [t.id, t]));

  // Create all matches sequentially to get auto-incremented matchNo
  const created = [];
  for (const m of matches) {
    const match = await db.matches.create({
      data: {
        tournamentId: m.tournamentId,
        sport: m.sport,
        name: m.name || null,
        venue: m.venue,
        scheduledOn: m.scheduledOn,
        pool: m.pool || null,
        gameId: m.gameId,
        round: m.round,
        status: m.status,
        isDraw: false,
        images: [],
        participants: [
          {
            familyId: m.participants?.[0]?.teamId || null,
            family: m.participants?.[0]?.teamName || null,
          },
          {
            familyId: m.participants?.[1]?.teamId || null,
            family: m.participants?.[1]?.teamName || null,
          },
        ],
      },
    });
    created.push(match);
  }

  // Update tournamentParticipation for all participants
  const participationUpdates = [];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const match = created[i];
    const participantIds = m.participants.map((p) => p.teamId).filter(Boolean);

    for (const familyId of participantIds) {
      participationUpdates.push(
        db.tournamentParticipation.updateMany({
          where: { familyId, tournamentId: m.tournamentId },
          data: { matchIds: { push: match.id } },
        }),
      );
    }
  }

  if (participationUpdates.length) {
    await Promise.all(participationUpdates);
  }

  // Single activity log for the bulk operation
  await logActivity({
    userId: user.id,
    action: "bulk-created",
    entity: "match",
    entityId: created[0]?.id,
    entityName: `${created.length} matches`,
    description: `Bulk created ${created.length} match${created.length > 1 ? "es" : ""} in tournament "${tournamentMap[matches[0].tournamentId]?.name}"`,
    request,
  });

  return successResponse(
    { matches: created, count: created.length },
    `${created.length} match${created.length > 1 ? "es" : ""} created successfully`,
    201,
  );
}

/* ---------------- EXPORT ---------------- */

export const POST = withErrorHandling(handlePost, "matches-bulk");
