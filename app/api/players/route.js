// app/api/players/route.js
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
import { BundleCopyPage } from "twilio/lib/rest/numbers/v2/regulatoryCompliance/bundle/bundleCopy";

/* ---------------- SCHEMAS ---------------- */

const querySchema = z.object({
  page: z.string().default("1"),
  limit: z.string().default("10"),
  search: z.string().optional(),
  sport: z
    .enum([
      "HOCKEY",
      "FOOTBALL",
      "BASKETBALL",
      "VOLLEYBALL",
      "CRICKET",
      "TENNIS",
      "BADMINTON",
      "ATHLETICS",
    ])
    .optional(),
  status: z.enum(["active", "inactive"]).optional(),
  familyId: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "playerName", "updatedAt", "dateOfBirth"])
    .default("playerName"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const createPlayerSchema = z.object({
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
  jerseyNumber: z.number().int().min(0).max(999).optional().nullable(),
  biography: z
    .string()
    .max(2000, "Biography must be less than 2000 characters")
    .optional(),
  info: z.array(z.record(z.any())).optional().default([]),
  familyId: z.string().min(1, "Family is required"),
  isActive: z.boolean().default(true),
});

/* ---------------- HANDLERS ---------------- */

async function handleGet(request) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "players:list", {
    requireAuthentication: false,
  });
  if (setup.error) return setup.error;

  // Query params
  const { searchParams } = new URL(request.url);
  const validated = querySchema.parse({
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    search: searchParams.get("search") || undefined,
    sport: searchParams.get("sport") || undefined,
    status: searchParams.get("status") || undefined,
    familyId: searchParams.get("familyId") || undefined,
    sortBy: searchParams.get("sortBy") || undefined,
    sortOrder: searchParams.get("sortOrder") || undefined,
  });

  const { page, limit, skip } = parsePagination(searchParams);

  // Build where clause
  const where = {
    ...buildSearchWhere(validated.search, ["playerName", "biography"]),
    ...(validated.sport && { primarySport: validated.sport }),
    ...(validated.status && {
      isActive: validated.status === "active",
    }),
    ...(validated.familyId && { familyId: validated.familyId }),
  };

  // Build orderBy based on sortBy parameter
  let orderBy;
  if (validated.sortBy === "playerName") {
    orderBy = { playerName: validated.sortOrder };
  } else if (validated.sortBy === "createdAt") {
    orderBy = { createdAt: validated.sortOrder };
  } else if (validated.sortBy === "updatedAt") {
    orderBy = { updatedAt: validated.sortOrder };
  } else if (validated.sortBy === "dateOfBirth") {
    orderBy = { dateOfBirth: validated.sortOrder };
  } else {
    orderBy = { playerName: "asc" };
  }

  // Fetch data with counts
  const [players, total] = await Promise.all([
    db.player.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        family: {
          select: {
            id: true,
            familyName: true,
          },
        },
        _count: {
          select: {
            manOfTheMatchIn: true,
          },
        },
      },
    }),
    db.player.count({ where }),
  ]);

  return successResponse({
    data: players,
    ...buildPaginationResponse(page, limit, total, players),
  });
}

async function handlePost(request) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "players:create");
  if (setup.error) return setup.error;

  const { user } = await auth();

  // Validate body
  const body = await request.json();

  const validated = createPlayerSchema.parse(body);

  // Check for duplicate player name in the same family
  const existing = await db.player.findFirst({
    where: {
      playerName: validated.playerName,
      familyId: validated.familyId,
    },
  });

  if (existing) {
    return errorResponse(
      "A player with this name already exists in this family",
      409,
    );
  }

  // Create player
  const player = await db.player.create({
    data: {
      playerName: validated.playerName,
      dateOfBirth: validated.dateOfBirth || null,
      primarySport: validated.primarySport || null,
      jerseyNumber: validated.jerseyNumber || null,
      biography: validated.biography || null,
      info: validated.info || [],
      familyId: validated.familyId,
      isActive: validated.isActive,
    },
  });

  // Log activity
  await logActivity({
    userId: user.id,
    action: "created",
    entity: "player",
    entityId: player.id,
    entityName: player.playerName,
    description: `Created player "${player.playerName}"`,
    request,
  });

  return successResponse(player, "Player created successfully", 201);
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "players");
export const POST = withErrorHandling(handlePost, "player");
