// app/api/families/[id]/route.js
import { z } from "zod";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  successResponse,
  errorResponse,
  logActivity,
  withErrorHandling,
} from "@/lib/api/helpers";
import { auth } from "@/auth";
import { deleteImageKitFile } from "@/lib/imageKit";

/* ---------------- SCHEMAS ---------------- */

const updateFamilySchema = z.object({
  familyName: z
    .string()
    .min(1, "Family name is required")
    .max(100, "Family name must be less than 100 characters")
    .optional(),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  colors: z
    .string()
    .max(500, "Colors must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  info: z.array(z.record(z.any())).optional(),
  images: z.array(z.string().url("Invalid image URL")).optional(),
});

/* ---------------- HANDLERS ---------------- */

async function handleGet(request, { params }) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "families:read", {
    requireAuthentication: false,
  });
  if (setup.error) return setup.error;

  const { id } = params;

  // Fetch family with related data
  const family = await db.families.findUnique({
    where: { id },
    include: {
      players: {
        select: {
          id: true,
          name: true,
          dateOfBirth: true,
          gender: true,
        },
        orderBy: {
          name: "asc",
        },
      },
      participations: {
        select: {
          id: true,
          tournament: {
            select: {
              id: true,
              name: true,
              year: true,
              status: true,
            },
          },
          sport: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      placements: {
        select: {
          id: true,
          position: true,
          tournament: {
            select: {
              id: true,
              name: true,
              year: true,
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
      allTimeAchievements: {
        select: {
          id: true,
          title: true,
          description: true,
          date: true,
        },
        orderBy: {
          date: "desc",
        },
      },
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

async function handlePut(request, { params }) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "families:update");
  if (setup.error) return setup.error;

  const { user } = await auth();
  const { familyId } = params;

  // Validate body
  const body = await request.json();
  const validated = updateFamilySchema.parse(body);

  // Check if family exists
  const existing = await db.families.findUnique({
    where: { id: familyId },
  });

  if (!existing) {
    return errorResponse("Family not found", 404);
  }

  // Check for duplicate name (if name is being changed)
  if (validated.familyName && validated.familyName !== existing.familyName) {
    const duplicate = await db.families.findFirst({
      where: {
        familyName: validated.familyName,
        id: { not: familyId },
      },
    });

    if (duplicate) {
      return errorResponse("A family with this name already exists", 409);
    }
  }

  // Build update data - only include fields that are provided
  const updateData = {
    ...(validated.familyName && { familyName: validated.familyName }),
    ...(validated.description !== undefined && {
      description: validated.description || null,
    }),
    ...(validated.colors !== undefined && {
      colors: validated.colors || null,
    }),
    ...(validated.info !== undefined && {
      info: validated.info,
    }),
    ...(validated.images !== undefined && {
      images: validated.images,
    }),
    updatedAt: new Date(),
  };
console.log(updateData)
  // Update family
  const family = await db.families.update({
    where: { id: familyId },
    data: updateData,
  });

  // Log activity
  await logActivity({
    userId: user.id,
    action: "updated",
    entity: "family",
    entityId: family.id,
    entityName: family.familyName,
    description: `Updated family "${family.familyName}"`,
    request,
  });

  return successResponse(family, "Family updated successfully");
}

async function handleDelete(request, { params }) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "families:delete");
  if (setup.error) return setup.error;

  const { user } = await auth();
  const { familyId } = params;

  // Check if family exists
  const family = await db.families.findUnique({
    where: { id: familyId },
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

  // Check for associated data and prevent deletion if any exist
  const counts = family._count;
  const associations = [];

  if (counts.players > 0) associations.push(`${counts.players} player(s)`);
  if (counts.participations > 0)
    associations.push(`${counts.participations} participation(s)`);
  if (counts.placements > 0)
    associations.push(`${counts.placements} placement(s)`);
  if (counts.payments > 0) associations.push(`${counts.payments} payment(s)`);

  if (associations.length > 0) {
    return errorResponse(
      `Cannot delete family. It is associated with ${associations.join(", ")}. Please remove the associations first.`,
      400,
    );
  }

  // Delete family images from ImageKit (async, don't wait)
  if (family.images && family.images.length > 0) {
    family.images.forEach((imageUrl) => {
      // Extract fileId from URL if possible
      const fileIdMatch = imageUrl.match(/\/([^\/]+)\.[^.]+$/);
      if (fileIdMatch && fileIdMatch[1]) {
        deleteImageKitFile(fileIdMatch[1]).catch((err) => {
          console.error("Failed to delete image from ImageKit:", err);
        });
      }
    });
  }

  // Delete family
  await db.families.delete({
    where: { id: familyId },
  });

  // Log activity
  await logActivity({
    userId: user.id,
    action: "deleted",
    entity: "family",
    entityId: familyId,
    entityName: family.familyName,
    description: `Deleted family "${family.familyName}"`,
    request,
  });

  return successResponse({ id: familyId }, "Family deleted successfully");
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "family");
export const PUT = withErrorHandling(handlePut, "family");
export const DELETE = withErrorHandling(handleDelete, "family");
