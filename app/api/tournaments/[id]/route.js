import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  checkRateLimit,
  clearRateLimit,
  incrementRateLimit,
} from "@/lib/rate-limit/rateLimiter";
import { RATE_LIMIT_PRESETS } from "@/lib/rate-limit/presets";
import { getRateLimitKey } from "@/lib/rate-limit/getRateLimitKey";
import { z } from "zod";

// Validation schemas
const SportTypeEnum = z.enum([
  "FIELD_HOCKEY",
  "FOOTBALL",
  "CRICKET",
  "RELAY",
  "BASKETBALL",
  "VOLLEYBALL",
  "KABADDI",
  "ATHLETICS",
  "BADMINTON",
  "TABLE_TENNIS",
  "TENNIS",
  "SQUASH",
  "CARROM",
  "CHESS",
  "THROWBALL",
  "KHO_KHO",
  "SWIMMING",
  "WRESTLING",
  "BOXING",
  "OTHER",
]);

const TournamentStatusEnum = z.enum([
  "DRAFT",
  "REGISTRATION",
  "UPCOMING",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
]);

const updateTournamentSchema = z.object({
  name: z.string().min(3).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  sports: z.array(SportTypeEnum).min(1).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  registrationDeadline: z.string().datetime().optional().nullable(),
  status: TournamentStatusEnum.optional(),
  description: z.string().optional().nullable(),
  sponsors: z.array(z.any()).optional(),
  info: z.array(z.any()).optional(),
  images: z.array(z.string().url()).optional(),
});

// GET - Get single tournament by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Rate limiting
    const rateLimitKey = getRateLimitKey(request, `tournaments:get:${id}`);
    const rateLimitCheck = await checkRateLimit(
      rateLimitKey,
      RATE_LIMIT_PRESETS.ADMIN_API
    );

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests",
          retryAfter: rateLimitCheck.retryAfter,
        },
        { status: 429 }
      );
    }

    await incrementRateLimit(rateLimitKey, RATE_LIMIT_PRESETS.ADMIN_API);

    // Parse query parameters for includes
    const { searchParams } = new URL(request.url);
    const includeParticipations =
      searchParams.get("includeParticipations") === "true";
    const includeMatches = searchParams.get("includeMatches") === "true";
    const includePlacements = searchParams.get("includePlacements") === "true";

    // Fetch tournament
    const tournament = await db.tournament.findUnique({
      where: { id },
      include: {
        participation: includeParticipations
          ? {
              include: {
                family: {
                  select: {
                    id: true,
                    familyName: true,
                    shortName: true,
                    colors: true,
                    images: true,
                  },
                },
              },
            }
          : false,
        matches: includeMatches
          ? {
              orderBy: { scheduledOn: "asc" },
            }
          : false,
        placements: includePlacements
          ? {
              include: {
                family: {
                  select: {
                    id: true,
                    familyName: true,
                    shortName: true,
                    images: true,
                  },
                },
              },
            }
          : false,
        _count: {
          select: {
            participation: true,
            matches: true,
            placements: true,
          },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tournament,
    });
  } catch (error) {
    console.error("GET /api/tournaments/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tournament" },
      { status: 500 }
    );
  }
}

// PATCH - Update tournament
export async function PATCH(request, { params }) {
  try {
    const { id } = params;

    // Rate limiting
    const rateLimitKey = getRateLimitKey(request, `tournaments:update:${id}`);
    const rateLimitCheck = await checkRateLimit(
      rateLimitKey,
      RATE_LIMIT_PRESETS.write
    );

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests",
          retryAfter: rateLimitCheck.retryAfter,
        },
        { status: 429 }
      );
    }

    await incrementRateLimit(rateLimitKey, RATE_LIMIT_PRESETS.write);

    // Check if tournament exists
    const existingTournament = await db.tournament.findUnique({
      where: { id },
    });

    if (!existingTournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validated = updateTournamentSchema.parse(body);

    // Validate dates if provided
    if (validated.startDate || validated.endDate) {
      const startDate = validated.startDate
        ? new Date(validated.startDate)
        : existingTournament.startDate;
      const endDate = validated.endDate
        ? new Date(validated.endDate)
        : existingTournament.endDate;

      if (endDate <= startDate) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400 }
        );
      }
    }

    if (validated.registrationDeadline) {
      const regDeadline = new Date(validated.registrationDeadline);
      const startDate = validated.startDate
        ? new Date(validated.startDate)
        : existingTournament.startDate;

      if (regDeadline >= startDate) {
        return NextResponse.json(
          { error: "Registration deadline must be before start date" },
          { status: 400 }
        );
      }
    }

    // Update tournament
    const updatedTournament = await db.tournament.update({
      where: { id },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.year && { year: validated.year }),
        ...(validated.sports && { sports: validated.sports }),
        ...(validated.startDate && {
          startDate: new Date(validated.startDate),
        }),
        ...(validated.endDate && { endDate: new Date(validated.endDate) }),
        ...(validated.registrationDeadline !== undefined && {
          registrationDeadline: validated.registrationDeadline
            ? new Date(validated.registrationDeadline)
            : null,
        }),
        ...(validated.status && { status: validated.status }),
        ...(validated.description !== undefined && {
          description: validated.description,
        }),
        ...(validated.sponsors && { sponsors: validated.sponsors }),
        ...(validated.info && { info: validated.info }),
        ...(validated.images && { images: validated.images }),
      },
      include: {
        _count: {
          select: {
            participation: true,
            matches: true,
            placements: true,
          },
        },
      },
    });

    clearRateLimit(rateLimitKey);
    return NextResponse.json({
      success: true,
      data: updatedTournament,
      message: "Tournament updated successfully",
    });
  } catch (error) {
    console.error("PATCH /api/tournaments/[id] error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update tournament" },
      { status: 500 }
    );
  }
}

// DELETE - Delete tournament
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Rate limiting
    const rateLimitKey = getRateLimitKey(request, `tournaments:delete:${id}`);
    const rateLimitCheck = checkRateLimit(
      rateLimitKey,
      RATE_LIMIT_PRESETS.ADMIN_API
    );

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests",
          retryAfter: rateLimitCheck.retryAfter,
        },
        { status: 429 }
      );
    }

    await incrementRateLimit(rateLimitKey, RATE_LIMIT_PRESETS.write);

    // Check if tournament exists
    const tournament = await db.tournament.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            participation: true,
            matches: true,
            placements: true,
          },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    // Check if tournament has data - maybe prevent deletion
    const hasData =
      tournament._count.participation > 0 ||
      tournament._count.matches > 0 ||
      tournament._count.placements > 0;

    if (hasData) {
      // Soft delete by setting status to CANCELLED
      const updatedTournament = await db.tournament.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      return NextResponse.json({
        success: true,
        data: updatedTournament,
        message:
          "Tournament has associated data and was marked as CANCELLED instead of deleted",
      });
    }

    // Hard delete if no associated data
    await db.tournament.delete({
      where: { id },
    });

    clearRateLimit(rateLimitKey);

    return NextResponse.json({
      success: true,
      message: "Tournament deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/tournaments/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete tournament" },
      { status: 500 }
    );
  }
}
