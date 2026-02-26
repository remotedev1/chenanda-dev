// app/api/sponsors/[id]/route.js
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
import { deleteImageKitFile } from "@/lib/imageKit";

/* ---------------- SCHEMAS ---------------- */

const updateSponsorSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  logo: z
    .array(
      z.object({
        url: z.string().url("Invalid logo URL"),
        id: z.string(),
      }),
    )
    .max(1)
    .optional()
    .or(z.literal("")),
  status: z.boolean().default(true),
});

/* ---------------- HANDLERS ---------------- */

async function handleGet(request, { params }) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "sponsors:read");
  if (setup.error) return setup.error;

  const { id } = params;

  // Fetch sponsor
  const sponsor = await db.sponsor.findUnique({
    where: { id },
    include: {
      tournaments: {
        select: {
          id: true,
          name: true,
          year: true,
          status: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!sponsor) {
    return errorResponse("Sponsor not found", 404);
  }

  return successResponse(sponsor);
}

async function handlePatch(request, { params }) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "sponsors:update");
  if (setup.error) return setup.error;

  // Validate body
  const body = await request.json();
  const validated = updateSponsorSchema.parse(body);

  // const { user } = await auth();
  const { sponsorId } = params;

  // Ability check
  // const ability = defineAbilityFor(user);
  // if (!ability.can(ACTIONS.UPDATE, RESOURCES.SPONSOR)) {
  //   return errorResponse("You don't have permission to update sponsors", 403);
  // }

  // Check if sponsor exists
  const existing = await db.sponsor.findUnique({
    where: { id: sponsorId },
  });

  if (!existing) {
    return errorResponse("Sponsor not found", 404);
  }

  if (
    validated.logo &&
    validated.logo.length > 0 &&
    validated.logo[0].id !== existing.logo?.[0]?.id
  ) {
    deleteImageKitFile(`${existing.logo[0].id}`).catch((err) => {
      console.error("Failed to delete old logo from ImageKit:", err);
    });
  }

  // Check for duplicate name (if name is being changed)
  if (validated.name && validated.name !== existing.name) {
    const duplicate = await db.sponsor.findFirst({
      where: {
        name: validated.name,
        id: { not: sponsorId },
      },
    });

    if (duplicate) {
      return errorResponse("A sponsor with this name already exists", 409);
    }
  }

  // Update sponsor
  const sponsor = await db.sponsor.update({
    where: { id: sponsorId },
    data: {
      ...(validated.name && { name: validated.name }),
      ...(validated.description !== undefined && {
        description: validated.description,
      }),
      ...(validated.website !== undefined && {
        website: validated.website || null,
      }),
      ...(validated.email !== undefined && { email: validated.email || null }),
      ...(validated.phone !== undefined && { phone: validated.phone || null }),
      ...(validated.logo !== undefined && { logo: validated.logo || null }),
      ...(validated.status !== undefined && { status: validated.status }),
      updatedAt: new Date(),
    },
  });

  // Log activity
  await logActivity({
    userId: setup.user.userId,
    action: "updated",
    entity: "sponsor",
    entityId: sponsor.id,
    entityName: sponsor.name,
    description: `Updated sponsor "${sponsor.name}"`,
    request,
  });

  return successResponse(sponsor, "Sponsor updated successfully");
}

async function handleDelete(request, { params }) {
  // Setup (auth + rate limit)
  const setup = await setupApiHandler(request, "sponsors:delete");
  if (setup.error) return setup.error;

  const { user } = await auth();
  const { sponsorId } = params;

  // Ability check
  const ability = defineAbilityFor(user);
  if (!ability.can(ACTIONS.DELETE, RESOURCES.SPONSOR)) {
    return errorResponse("You don't have permission to delete sponsors", 403);
  }

  // Check if sponsor exists
  const sponsor = await db.sponsor.findUnique({
    where: { id: sponsorId },
  });

  if (!sponsor) {
    return errorResponse("Sponsor not found", 404);
  }

  //TODO: Check for associated tournaments and prevent deletion if any exist
  // Check if sponsor has associated tournaments
  // if (sponsor.tournaments > 0) {
  //   return errorResponse(
  //     `Cannot delete sponsor. It is associated with ${sponsor._count.tournaments} tournament(s). Please remove the associations first.`,
  //     400,
  //   );
  // }

  // Delete sponsor
  await db.sponsor.delete({
    where: { id: sponsorId },
  });

  deleteImageKitFile(`${sponsor.logo[0].id}`).catch((err) => {
    console.error("Failed to delete old logo from ImageKit:", err);
  });

  // Log activity
  await logActivity({
    userId: setup.user.userId,
    action: "deleted",
    entity: "sponsor",
    entityId: sponsorId,
    entityName: sponsor.name,
    description: `Deleted sponsor "${sponsor.name}"`,
    request,
  });

  return successResponse({ id: sponsorId }, "Sponsor deleted successfully");
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "sponsor");
export const PATCH = withErrorHandling(handlePatch, "sponsor");
export const DELETE = withErrorHandling(handleDelete, "sponsor");
