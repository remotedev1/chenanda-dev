import { NextResponse } from "next/server";
import {
  checkRateLimit,
  clearRateLimit,
  incrementRateLimit,
} from "@/lib/rate-limit/rateLimiter";
import { RATE_LIMIT_PRESETS } from "@/lib/rate-limit/presets";
import { getRateLimitKey } from "@/lib/rate-limit/getRateLimitKey";
import { z } from "zod";
import { db } from "@/lib/db";

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

const createTournamentSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  year: z.number().int().min(2000).max(2100),
  sports: z.array(SportTypeEnum).min(1, "At least one sport is required"),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  registrationDeadline: z.string().datetime().optional(),
  status: TournamentStatusEnum.optional(),
  description: z.string().optional(),
  sponsors: z.array(z.any()).optional(),
  info: z.array(z.any()).optional(),
  images: z.array(z.string().url()).optional(),
});

const querySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  status: TournamentStatusEnum.optional(),
  sport: SportTypeEnum.optional(),
  year: z.string().optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(["startDate", "name", "createdAt"])
    .optional()
    .default("startDate"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// GET - List tournaments with filtering and pagination
export async function GET(request) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request, "tournaments:list");
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

    await incrementRateLimit(rateLimitKey, RATE_LIMIT_PRESETS.ADMIN_API);

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "10",
      status: searchParams.get("status") || undefined,
      sport: searchParams.get("sport") || undefined,
      year: searchParams.get("year") || undefined,
      search: searchParams.get("search") || undefined,
      sortBy: searchParams.get("sortBy") || "startDate",
      sortOrder: searchParams.get("sortOrder") || "desc",
    };

    const validated = querySchema.parse(queryParams);
    const page = parseInt(validated.page);
    const limit = Math.min(parseInt(validated.limit), 100); // Max 100 items
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (validated.status) {
      where.status = validated.status;
    }

    if (validated.sport) {
      where.sports = {
        has: validated.sport,
      };
    }

    if (validated.year) {
      where.year = parseInt(validated.year);
    }

    if (validated.search) {
      where.OR = [
        { name: { contains: validated.search, mode: "insensitive" } },
        { description: { contains: validated.search, mode: "insensitive" } },
      ];
    }

    // Get tournaments with pagination
    const [tournaments, total] = await Promise.all([
      db.tournament.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [validated.sortBy]: validated.sortOrder,
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
      }),
      db.tournament.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: tournaments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + tournaments.length < total,
      },
    });
  } catch (error) {
    console.error("GET /api/tournaments error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch tournaments" },
      { status: 500 }
    );
  }
}

// POST - Create a new tournament
export async function POST(request) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request, "tournaments:create");
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

     incrementRateLimit(rateLimitKey, RATE_LIMIT_PRESETS.ADMIN_API);

    // Parse and validate request body
    const body = await request.json();
    const validated = createTournamentSchema.parse(body);

    // Validate dates
    const startDate = new Date(validated.startDate);
    const endDate = new Date(validated.endDate);

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    if (validated.registrationDeadline) {
      const regDeadline = new Date(validated.registrationDeadline);
      if (regDeadline >= startDate) {
        return NextResponse.json(
          { error: "Registration deadline must be before start date" },
          { status: 400 }
        );
      }
    }

    // Create tournament
    const tournament = await db.tournament.create({
      data: {
        name: validated.name,
        year: validated.year,
        sports: validated.sports,
        startDate: new Date(validated.startDate),
        endDate: new Date(validated.endDate),
        registrationDeadline: validated.registrationDeadline
          ? new Date(validated.registrationDeadline)
          : undefined,
        status: validated.status || "DRAFT",
        description: validated.description,
        sponsors: validated.sponsors || [],
        info: validated.info || [],
        images: validated.images || [],
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

    return NextResponse.json(
      {
        success: true,
        data: tournament,
        message: "Tournament created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/tournaments error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create tournament" },
      { status: 500 }
    );
  }
}
