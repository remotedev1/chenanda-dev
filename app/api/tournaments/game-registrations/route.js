import { z } from "zod";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  parsePagination,
  buildPaginationResponse,
  buildSearchWhere,
  successResponse,
  errorResponse,
  withErrorHandling,
} from "@/lib/api/helpers";

/* ---------------- SCHEMA ---------------- */

const querySchema = z.object({
  page: z.string().default("1"),
  limit: z.string().default("10"),
  search: z.string().optional(),
  paymentStatus: z.enum(["PENDING", "CONFIRMED", "REJECTED"]).optional(),
  pool: z.string().optional(),
  sortBy: z
    .enum(["registeredAt", "confirmedAt", "createdAt", "updatedAt"])
    .default("registeredAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/* ---------------- HANDLER ---------------- */

async function handleGet(request, { params }) {
  const setup = await setupApiHandler(request, "game-registrations:list", {
    requireAuthentication: false,
  });
  if (setup.error) return setup.error;

  const { searchParams } = new URL(request.url);

  const gameId = searchParams.get("gameId") || undefined;

  const validated = querySchema.parse({
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    search: searchParams.get("search") || undefined,
    paymentStatus: searchParams.get("paymentStatus") || undefined,
    pool: searchParams.get("pool") || undefined,
    sortBy: searchParams.get("sortBy") || undefined,
    sortOrder: searchParams.get("sortOrder") || undefined,
  });

  const { page, limit, skip } = parsePagination(searchParams);

  const where = {
    ...(gameId && { gameId }),
    ...buildSearchWhere(validated.search, ["team.name"]),
    ...(validated.paymentStatus && { paymentStatus: validated.paymentStatus }),
    ...(validated.pool && { pool: validated.pool }),
  };

  const orderBy = { [validated.sortBy]: validated.sortOrder };

  const [registrations, total] = await Promise.all([
    db.gameRegistration.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        family: true,
        participation: {
          select: {
            id: true,
            familyId: true,
          },
        },
      },
    }),
    db.gameRegistration.count({ where }),
  ]);


  return successResponse({
    data: registrations,
    ...buildPaginationResponse(page, limit, total, registrations),
  });
}

/* ---------------- EXPORT ---------------- */

export const GET = withErrorHandling(handleGet, "game-registrations");
