import { z } from "zod";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  findEntity,
  checkDuplicate,
  buildUpdateData,
  successResponse,
  errorResponse,
  logActivity,
  getUpdateDescription,
  withErrorHandling,
} from "@/lib/api/helpers";
import { defineAbilityFor } from "@/lib/ability";

/* ---------------- SCHEMAS ---------------- */

const updateFamilySchema = z.object({
  familyName: z.string().min(3).max(100).optional(),
  shortName: z.string().max(20).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  colors: z
    .array(z.string().regex(/^#[0-9A-Fa-f]{6}$/))
    .max(10)
    .optional(),
  images: z.array(z.string().url()).max(10).optional(),
  info: z.array(z.any()).max(20).optional(),
});

/* ---------------- HANDLERS ---------------- */

async function handleGet(request, { params }) {
  const { id } = params;

  // Setup
  const setup = await setupApiHandler(request, `families:get:${id}`);
  if (setup.error) return setup.error;

  // Check ability
  const ability = defineAbilityFor(setup.user);
  if (!ability.can("read", "Family")) {
    return errorResponse("You don't have permission to view families", 403);
  }

  // Parse includes
  const { searchParams } = new URL(request.url);
  const includePlayers = searchParams.get("includePlayers") === "true";
  const includeParticipations =
    searchParams.get("includeParticipations") === "true";
  const includePlacements = searchParams.get("includePlacements") === "true";

  // Fetch family
  const family = await db.families.findUnique({
    where: { id },
    include: {
      players: includePlayers
        ? { select: { id: true, name: true, role: true, image: true } }
        : false,
      participations: includeParticipations
        ? {
            include: {
              tournament: {
                select: { id: true, name: true, year: true, status: true },
              },
            },
          }
        : false,
      placements: includePlacements
        ? {
            include: {
              tournament: {
                select: { id: true, name: true, year: true },
              },
            },
          }
        : false,
      _count: {
        select: {
          players: true,
          participations: true,
          placements: true,
          payments: true,
        },
      },
    },
  });

  if (!family) {
    return errorResponse("Family not found", 404);
  }

  return successResponse(family);
}

async function handlePatch(request, { params }) {
  const { id } = params;

  // Setup
  const setup = await setupApiHandler(request, `families:update:${id}`);
  if (setup.error) return setup.error;

  // Check ability
  const ability = defineAbilityFor(setup.user);
  if (!ability.can("update", "Family")) {
    return errorResponse("You don't have permission to update families", 403);
  }

  // Check if exists
  const { error: notFoundError, entity: existingFamily } = await findEntity(
    "families",
    id,
    "Family"
  );
  if (notFoundError) return notFoundError;

  // Parse and validate
  const body = await request.json();
  const validated = updateFamilySchema.parse(body);

  // Check for duplicate name if updating
  if (
    validated.familyName &&
    validated.familyName !== existingFamily.familyName
  ) {
    const isDuplicate = await checkDuplicate(
      "families",
      "familyName",
      validated.familyName,
      id
    );

    if (isDuplicate) {
      return errorResponse("A family with this name already exists", 409);
    }
  }

  // Build update data
  const updateData = buildUpdateData(validated);

  // Update family
  const updatedFamily = await db.families.update({
    where: { id },
    data: updateData,
    include: {
      _count: {
        select: {
          players: true,
          participations: true,
          placements: true,
          payments: true,
        },
      },
    },
  });

  // Log activity
  await logActivity({
    userId: setup.user.userId,
    action: "updated",
    entity: "family",
    entityId: id,
    entityName: updatedFamily.familyName,
    description: getUpdateDescription(
      updatedFamily.familyName,
      "family",
      updateData
    ),
    request,
  });

  return successResponse(updatedFamily, "Family updated successfully");
}

async function handleDelete(request, { params }) {
  const { id } = params;

  // Setup
  const setup = await setupApiHandler(request, `families:delete:${id}`);
  if (setup.error) return setup.error;

  // Check ability
  const ability = defineAbilityFor(setup.user);
  if (!ability.can("delete", "Family")) {
    return errorResponse("You don't have permission to delete families", 403);
  }

  // Fetch family with counts
  const family = await db.families.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          players: true,
          participations: true,
          placements: true,
          payments: true,
        },
      },
    },
  });

  if (!family) {
    return errorResponse("Family not found", 404);
  }

  // Check for associated data
  const hasData =
    family._count.players > 0 ||
    family._count.participations > 0 ||
    family._count.placements > 0 ||
    family._count.payments > 0;

  if (hasData) {
    return errorResponse("Cannot delete family with associated data", 409, {
      players: family._count.players,
      participations: family._count.participations,
      placements: family._count.placements,
      payments: family._count.payments,
    });
  }

  // Delete family
  await db.families.delete({ where: { id } });

  // Log activity
  await logActivity({
    userId: setup.user.userId,
    action: "deleted",
    entity: "family",
    entityId: id,
    entityName: family.familyName,
    description: `Permanently deleted family "${family.familyName}"`,
    request,
  });

  return successResponse(null, "Family deleted successfully");
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "family");
export const PATCH = withErrorHandling(handlePatch, "family");
export const DELETE = withErrorHandling(handleDelete, "family");