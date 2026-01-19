import { z } from "zod";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  successResponse,
  errorResponse,
  withErrorHandling,
} from "@/lib/api/helpers";

/* ---------------- SCHEMAS ---------------- */

const querySchema = z.object({
  search: z.string().optional(),
  limit: z.string().default("50"),
});

/* ---------------- HANDLERS ---------------- */

async function handleGet(request) {
  // Setup (no auth required for public registration)
  const setup = await setupApiHandler(request, "families:list");
  if (setup.error) return setup.error;

  // Query params
  const { searchParams } = new URL(request.url);
  const validated = querySchema.parse({
    search: searchParams.get("search") || undefined,
    limit: searchParams.get("limit") || "50",
  });

  const limit = parseInt(validated.limit);

  // Build where clause
  const where = validated.search
    ? {
        familyName: {
          contains: validated.search,
          mode: "insensitive",
        },
      }
    : {};

  // Fetch families
  const families = await db.families.findMany({
    where,
    take: limit,
    orderBy: { familyName: "asc" },
    select: {
      id: true,
      familyName: true,
      description: true,
      colors: true,
      images: true,
    },
  });

  return successResponse({
    families,
    count: families.length,
  });
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "families");