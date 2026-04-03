// app/api/matches/route.js
import { z } from "zod";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  parsePagination,
  buildPaginationResponse,
  buildSearchWhere,
  successResponse,
  errorResponse,
  logActivity,
  withErrorHandling,
} from "@/lib/api/helpers";
import { auth } from "@/auth";

/* ---------------- SCHEMAS ---------------- */

const querySchema = z.object({
  page: z.string().default("1"),
  limit: z.string().default("10"),
  search: z.string().optional(),
  tournamentId: z.string().optional(),
  sport: z.string().optional(),
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
  round: z.string().optional(),
  pool: z.string().optional(),
  venue: z.string().optional(),
  sortBy: z
    .enum(["scheduledOn", "matchNo", "createdAt", "updatedAt", "status"])
    .default("scheduledOn"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const createMatchSchema = z.object({
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
  scheduledOn: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .or(z.date()),
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
  winnerId: z.string().optional().nullable(),
  winnerName: z.string().optional().nullable(),
  isDraw: z.boolean().default(false),
  manOfTheMatchId: z.string().optional().nullable(),
  nextMatchId: z.string().optional().nullable(),
  sponsor: z.string().max(200).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  participants: z
    .array(
      z.object({
        teamId: z.string().optional(),
        teamName: z.string().optional(),
      }),
    )
    .length(2),
});

/* ---------------- HANDLERS ---------------- */

async function handleGet(request) {
  const setup = await setupApiHandler(request, "matches:list");
  if (setup.error) return setup.error;

  const { searchParams } = new URL(request.url);

  const validated = querySchema.parse({
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    search: searchParams.get("search") || undefined,
    tournamentId: searchParams.get("tournamentId") || undefined,
    sport: searchParams.get("sport") || undefined,
    status: searchParams.get("status") || undefined,
    round: searchParams.get("round") || undefined,
    pool: searchParams.get("pool") || undefined,
    venue: searchParams.get("venue") || undefined,
    sortBy: searchParams.get("sortBy") || undefined,
    sortOrder: searchParams.get("sortOrder") || undefined,
  });

  const { page, limit, skip } = parsePagination(searchParams);

  const where = {
    ...buildSearchWhere(validated.search, ["name", "notes", "winnerName"]),
    ...(validated.tournamentId && { tournamentId: validated.tournamentId }),
    ...(validated.sport && { sport: validated.sport }),
    ...(validated.status && { status: validated.status }),
    ...(validated.round && { round: validated.round }),
    ...(validated.pool && { pool: validated.pool }),
    ...(validated.venue && { venue: validated.venue }),
  };

  const orderBy = (() => {
    const dir = validated.sortOrder;
    switch (validated.sortBy) {
      case "matchNo":
        return { matchNo: dir };
      case "createdAt":
        return { createdAt: dir };
      case "updatedAt":
        return { updatedAt: dir };
      case "status":
        return { status: dir };
      default:
        return { scheduledOn: dir };
    }
  })();

  const [matches, total] = await Promise.all([
    db.matches.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        tournament: { select: { id: true, name: true } },
      },
    }),
    db.matches.count({ where }),
  ]);

  return successResponse({
    data: matches,
    ...buildPaginationResponse(page, limit, total, matches),
  });
}

async function handlePost(request) {
  const setup = await setupApiHandler(request, "matches:create");
  if (setup.error) return setup.error;

  const { user } = await auth();

  const body = await request.json();
  const validated = createMatchSchema.parse(body);

  // Verify tournament exists
  const tournament = await db.tournament.findUnique({
    where: { id: validated.tournamentId },
    select: { id: true, name: true },
  });
  if (!tournament) {
    return errorResponse("Selected tournament does not exist", 400);
  }

  const match = await db.matches.create({
    data: {
      tournamentId: validated.tournamentId,
      sport: validated.sport,
      name: validated.name || null,
      venue: validated.venue,
      scheduledOn: validated.scheduledOn,
      actualStartTime: validated.actualStartTime || null,
      actualEndTime: validated.actualEndTime || null,
      pool: validated.pool || null,
      round: validated.round,
      status: validated.status,
      winnerId: validated.winnerId || null,
      winnerName: validated.winnerName || null,
      isDraw: validated.isDraw,
      manOfTheMatchId: validated.manOfTheMatchId || null,
      nextMatchId: validated.nextMatchId || null,
      sponsor: validated.sponsor || null,
      notes: validated.notes || null,
      images: [],
      participants: [
        {
          familyId: validated.participants?.[0]?.teamId,
          family: validated.participants?.[0]?.teamName,
        },
        {
          familyId: validated.participants?.[1]?.teamId,
          family: validated.participants?.[1]?.teamName,
        },
      ],
    },
  });

  // Update tournamentParticipation for both participants
  const participantIds = validated.participants
    ?.map((p) => p.teamId)
    .filter(Boolean);

  if (participantIds?.length) {
    await Promise.all(
      participantIds.map((familyId) =>
        db.tournamentParticipation.updateMany({
          where: {
            familyId,
            tournamentId: validated.tournamentId,
          },
          data: {
            matchIds: { push: match.id },
          },
        }),
      ),
    );
  }

  await logActivity({
    userId: user.id,
    action: "created",
    entity: "match",
    entityId: match.id,
    entityName: match.name || `Match #${match.matchNo}`,
    description: `Created ${match.sport} Match #${match.matchNo} in tournament "${tournament.name}"`,
    request,
  });

  return successResponse(match, "Match created successfully", 201);
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "matches");
export const POST = withErrorHandling(handlePost, "match");
