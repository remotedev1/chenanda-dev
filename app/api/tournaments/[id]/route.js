import { z } from "zod";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  successResponse,
  errorResponse,
  logActivity,
  withErrorHandling,
} from "@/lib/api/helpers";
import { ACTIONS, defineAbilityFor, RESOURCES } from "@/lib/ability";
import { auth } from "@/auth";

/* ---------------- ENUMS ---------------- */

const TournamentStatusEnum = z.enum([
  "DRAFT",
  "REGISTRATION",
  "UPCOMING",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
]);

/* ---------------- SCHEMAS ---------------- */

const updateTournamentSchema = z.object({
  name: z.string().min(3).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  registrationDeadline: z.string().datetime().optional().nullable(),
  status: TournamentStatusEnum.optional(),
  description: z.string().optional().nullable(),
  sponsors: z.array(z.any()).optional(),
  info: z.array(z.any()).optional(),
  images: z.array(z.string().url()).optional(),
});

/* ---------------- HANDLERS ---------------- */

/* ========== GET SINGLE TOURNAMENT ========== */

async function handleGet(request, { params }) {
  const setup = await setupApiHandler(request, "tournaments:get");
  if (setup.error) return setup.error;

  const { id } = params;
  const { searchParams } = new URL(request.url);

  const includeParticipation =
    searchParams.get("includeParticipation") === "true";
  const includeMatches = searchParams.get("includeMatches") === "true";
  const includePlacements = searchParams.get("includePlacements") === "true";

  const tournament = await db.tournament.findUnique({
    where: { id },
    include: {
      participation: includeParticipation
        ? {
            include: {
              family: {
                select: {
                  id: true,
                  familyName: true,
                  images: true,
                },
              },
            },
          }
        : false,
      matches: includeMatches ? { orderBy: { scheduledOn: "asc" } } : false,
      placements: includePlacements
        ? {
            include: {
              family: {
                select: {
                  id: true,
                  familyName: true,
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
    return errorResponse("Tournament not found", 404);
  }

  return successResponse(tournament);
}

/* ========== UPDATE TOURNAMENT ========== */

async function handlePatch(request, { params }) {
  const setup = await setupApiHandler(request, "tournaments:update");
  if (setup.error) return setup.error;
  const user = await auth();

  const ability = defineAbilityFor(user);
  if (!ability.can(ACTIONS.MANAGE, "all")) {
    return errorResponse(
      "You don't have permission to update tournaments",
      403
    );
  }

  const { id } = params;

  const existingTournament = await db.tournament.findUnique({
    where: { id },
  });

  if (!existingTournament) {
    return errorResponse("Tournament not found", 404);
  }

  const body = await request.json();
  const validated = updateTournamentSchema.parse(body);

  // Date validation
  if (validated.startDate || validated.endDate) {
    const startDate = validated.startDate
      ? new Date(validated.startDate)
      : existingTournament.startDate;

    const endDate = validated.endDate
      ? new Date(validated.endDate)
      : existingTournament.endDate;

    if (endDate <= startDate) {
      return errorResponse("End date must be after start date", 400);
    }
  }

  if (validated.registrationDeadline) {
    const regDeadline = new Date(validated.registrationDeadline);
    const startDate = validated.startDate
      ? new Date(validated.startDate)
      : existingTournament.startDate;

    if (regDeadline >= startDate) {
      return errorResponse(
        "Registration deadline must be before start date",
        400
      );
    }
  }

  const updatedTournament = await db.tournament.update({
    where: { id },
    data: {
      ...(validated.name && { name: validated.name }),
      ...(validated.year && { year: validated.year }),
      ...(validated.startDate && {
        startDate: new Date(validated.startDate),
      }),
      ...(validated.endDate && {
        endDate: new Date(validated.endDate),
      }),
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

  await logActivity({
    userId: user.id,
    action: "updated",
    entity: "tournament",
    entityId: updatedTournament.id,
    entityName: updatedTournament.name,
    description: `Updated tournament "${updatedTournament.name}"`,
    request,
  });

  return successResponse(updatedTournament, "Tournament updated successfully");
}

/* ========== DELETE TOURNAMENT ========== */

async function handleDelete(request, { params }) {
  const setup = await setupApiHandler(request, "tournaments:delete");
  if (setup.error) return setup.error;

  const ability = defineAbilityFor(setup.user);
  if (!ability.can(ACTIONS.DELETE, RESOURCES.TOURNAMENT)) {
    return errorResponse(
      "You don't have permission to delete tournaments",
      403
    );
  }

  const { id } = params;

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
    return errorResponse("Tournament not found", 404);
  }

  const hasData =
    tournament._count.participation > 0 ||
    tournament._count.matches > 0 ||
    tournament._count.placements > 0;

  // Soft delete if tournament has data
  if (hasData) {
    const cancelledTournament = await db.tournament.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    await logActivity({
      userId: setup.user.userId,
      action: "cancelled",
      entity: "tournament",
      entityId: cancelledTournament.id,
      entityName: cancelledTournament.name,
      description: `Cancelled tournament "${cancelledTournament.name}"`,
      request,
    });

    return successResponse(
      cancelledTournament,
      "Tournament has data and was marked as CANCELLED"
    );
  }

  // Hard delete if no relations
  await db.tournament.delete({ where: { id } });

  await logActivity({
    userId: setup.user.userId,
    action: "deleted",
    entity: "tournament",
    entityId: id,
    entityName: tournament.name,
    description: `Deleted tournament "${tournament.name}"`,
    request,
  });

  return successResponse(null, "Tournament deleted successfully");
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "tournament");
export const PATCH = withErrorHandling(handlePatch, "tournament");
export const DELETE = withErrorHandling(handleDelete, "tournament");
