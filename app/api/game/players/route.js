import { z } from "zod";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  parsePagination,
  buildPaginationResponse,
  buildSearchWhere,
  successResponse,
  errorResponse,
  checkDuplicate,
  logActivity,
  withErrorHandling,
} from "@/lib/api/helpers";
import { ACTIONS, defineAbilityFor } from "@/lib/ability";

/* ---------------- ENUMS ---------------- */

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

/* ---------------- SCHEMAS ---------------- */

const querySchema = z.object({
  page: z.string().default("1"),
  limit: z.string().default("10"),
  search: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "playerName", "jerseyNumber"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const createPlayerSchema = z.object({
  playerName: z.string().min(2).max(100),
  dateOfBirth: z.string().datetime().optional(),
  primarySport: SportTypeEnum.optional(),
  jerseyNumber: z.number().int().positive().optional(),
  biography: z.string().max(1000).optional(),
  familyId: z.string(),
});

/* ---------------- HANDLERS ---------------- */

async function handleGet(request) {
  const setup = await setupApiHandler(request, "players:list");
  if (setup.error) return setup.error;

  const { searchParams } = new URL(request.url);
  const validated = querySchema.parse({
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    search: searchParams.get("search") || undefined,
    sortBy: searchParams.get("sortBy") || undefined,
    sortOrder: searchParams.get("sortOrder") || undefined,
  });

  const { page, limit, skip } = parsePagination(searchParams);
  const where = buildSearchWhere(validated.search, ["playerName", "biography"]);

  const [players, total] = await Promise.all([
    db.player.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [validated.sortBy]: validated.sortOrder },
      include: {
        family: {
          select: {
            id: true,
            familyName: true,
            shortName: true,
            colors: true,
          },
        },
      },
    }),
    db.player.count({ where }),
  ]);

  return successResponse({
    players,
    pagination: buildPaginationResponse(page, limit, total, players),
  });
}

async function handlePost(request) {
  const setup = await setupApiHandler(request, "players:create");
  if (setup.error) return setup.error;

  const ability = defineAbilityFor(setup.user);
  if (!ability.can(ACTIONS.CREATE,RESOURCES.PLAYER)) {
    return errorResponse("You don't have permission to create players", 403);
  }

  const body = await request.json();
  const validated = createPlayerSchema.parse(body);

  // Ensure family exists
  const family = await db.families.findUnique({
    where: { id: validated.familyId },
  });

  if (!family) {
    return errorResponse("Family not found", 404);
  }

  const player = await db.player.create({
    data: {
      playerName: validated.playerName,
      dateOfBirth: validated.dateOfBirth
        ? new Date(validated.dateOfBirth)
        : null,
      primarySport: validated.primarySport,
      jerseyNumber: validated.jerseyNumber,
      biography: validated.biography,
      familyId: validated.familyId,
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
