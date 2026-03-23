import { z } from "zod";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  buildPaginationResponse,
  successResponse,
  withErrorHandling,
} from "@/lib/api/helpers";

/* ---------------- SCHEMAS ---------------- */

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  id: z.string().optional(),
  search: z.string().optional(),
  action: z.enum(["created", "updated", "deleted", "all"]).default("all"),
  entity: z.string().optional(),
  userId: z.string().optional(), // optional — omit to get ALL logs
  sortBy: z
    .enum(["timestamp", "action", "entity", "entityName"])
    .default("timestamp"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

/* ---------------- HANDLER ---------------- */

async function handleGet(request) {
  // const setup = await setupApiHandler(request, "activity:list");
  // console.log(setup);
  // if (setup.error) return setup.error;

  const { searchParams } = new URL(request.url);

  const rawParams = {
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    id: searchParams.get("id") || undefined,
    search: searchParams.get("search") || undefined,
    action: searchParams.get("action") || undefined,
    entity: searchParams.get("entity") || undefined,
    userId: searchParams.get("userId") || undefined, // pass to filter by user; omit for all
    sortBy: searchParams.get("sortBy") || undefined,
    sortOrder: searchParams.get("sortOrder") || undefined,
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
  };

  const validated = querySchema.parse(rawParams);
  // Derive skip directly from validated values — no parsePagination needed here
  const skip = (validated.page - 1) * validated.limit;

  /* ---- Build WHERE clause ---- */
  const where = {};

  // Filter by specific log id — only when explicitly provided
  if (validated.id) {
    where.id = validated.id;
  }

  if (validated.search) {
    where.OR = [
      { description: { contains: validated.search, mode: "insensitive" } },
      { entityName: { contains: validated.search, mode: "insensitive" } },
      { action: { contains: validated.search, mode: "insensitive" } },
      { entity: { contains: validated.search, mode: "insensitive" } },
    ];
  }

  if (validated.action && validated.action !== "all") {
    where.action = validated.action;
  }

  if (validated.entity) {
    where.entity = { equals: validated.entity, mode: "insensitive" };
  }

  // Only applied when userId is explicitly provided — omit for all users
  if (validated.userId) {
    where.userId = validated.userId;
  }

  if (validated.dateFrom || validated.dateTo) {
    where.timestamp = {};
    if (validated.dateFrom) {
      where.timestamp.gte = new Date(validated.dateFrom);
    }
    if (validated.dateTo) {
      const to = new Date(validated.dateTo);
      to.setHours(23, 59, 59, 999);
      where.timestamp.lte = to;
    }
  }

  /* ---- Execute queries in parallel ---- */
  const [logs, total, distinctEntities] = await Promise.all([
    db.activityLog.findMany({
      where,
      skip,
      take: validated.limit,
      orderBy: { [validated.sortBy]: validated.sortOrder },
      select: {
        User: true,
      },
    }),
    db.activityLog.count({ where }),
    db.activityLog.findMany({
      select: { entity: true },
      distinct: ["entity"],
      orderBy: { entity: "asc" },
    }),
  ]);

  return successResponse({
    data: logs,
    meta: {
      ...buildPaginationResponse(validated.page, validated.limit, total, logs),
      filters: {
        entities: distinctEntities.map((e) => e.entity),
      },
    },
  });
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "activity");
