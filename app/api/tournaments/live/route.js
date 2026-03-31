import { db } from "@/lib/db";
import { successResponse, withErrorHandling } from "@/lib/api/helpers";

// ─────────────────────────────────────────────────────────────
// GET → Return ONLY LIVE matches (for broadcast)
// ─────────────────────────────────────────────────────────────
async function handleGet() {
  const matches = await db.matches.findMany({
    where: {
      status: "LIVE", // 🔥 only live matches
    },
    orderBy: {
      scheduledOn: "asc",
    },
    include: {
      tournament: {
        select: { id: true, name: true },
      },
      game: {
        select: { id: true, name: true, icon: true },
      },
    },
  });

  return successResponse({
    data: matches,
    count: matches.length,
  });
}

// ─────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────
export const GET = withErrorHandling(handleGet, "live-matches");
