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

const updateSponsorSchema = z.object({
  name: z.string().min(2).max(100).optional(),
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
  status: z.boolean().optional(),
  category: z.enum(["TITLE", "GOLD", "SILVER", "BRONZE"]).optional(),
});

/* ---------------- HANDLERS ---------------- */

async function handleGet(request, { params }) {
  const setup = await setupApiHandler(request, "sponsors:read");
  if (setup.error) return setup.error;

  const { sponsorid } = await params;

  const sponsor = await db.sponsor.findUnique({
    where: { id: sponsorid },
    include: {
      Tournament: {
        select: {
          id: true,
          name: true,
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
  const setup = await setupApiHandler(request, "sponsors:update");
  if (setup.error) return setup.error;

  const { user } = await auth();
  const body = await request.json();
  const validated = updateSponsorSchema.parse(body);

  const { sponsorid } = await params;
  const existing = await db.sponsor.findUnique({
    where: { id: sponsorid },
  });

  if (!existing) {
    return errorResponse("Sponsor not found", 404);
  }

  // Delete old logo from ImageKit if replaced
  if (
    validated.logo &&
    validated.logo.length > 0 &&
    validated.logo[0].id !== existing.logo?.[0]?.id
  ) {
    deleteImageKitFile(`${existing.logo[0].id}`).catch((err) => {
      console.error("Failed to delete old logo from ImageKit:", err);
    });
  }

  // Check for duplicate name if name is being changed
  if (validated.name && validated.name !== existing.name) {
    const duplicate = await db.sponsor.findFirst({
      where: {
        name: validated.name,
        id: { not: sponsorid },
      },
    });

    if (duplicate) {
      return errorResponse("A sponsor with this name already exists", 409);
    }
  }

  const sponsor = await db.sponsor.update({
    where: { id: sponsorid },
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
      ...(validated.category && { category: validated.category }),
    },
  });

  await logActivity({
    userId: user.id,
    action: "updated",
    entity: "sponsor",
    entityId: sponsor.id,
    entityName: sponsor.name,
    description: `Updated sponsor "${sponsor.name}"${validated.category ? ` — category set to ${validated.category}` : ""}`,
    request,
  });

  return successResponse(sponsor, "Sponsor updated successfully");
}

async function handleDelete(request, { params }) {
  const setup = await setupApiHandler(request, "sponsors:delete");
  if (setup.error) return setup.error;

  const { sponsorid } = await params;
  const { user } = await auth();

  const sponsor = await db.sponsor.findUnique({
    where: { id: sponsorid },
  });

  if (!sponsor) {
    return errorResponse("Sponsor not found", 404);
  }

  // Prevent deletion if sponsor is linked to a tournament
  if (sponsor.tournamentId) {
    return errorResponse(
      "Cannot delete sponsor. It is associated with a tournament. Please remove the association first.",
      400,
    );
  }

  await db.sponsor.delete({
    where: { id: sponsorid },
  });

  // Delete logo from ImageKit if exists
  if (sponsor.logo?.[0]?.id) {
    deleteImageKitFile(`${sponsor.logo[0].id}`).catch((err) => {
      console.error("Failed to delete logo from ImageKit:", err);
    });
  }

  await logActivity({
    userId: user.id,
    action: "deleted",
    entity: "sponsor",
    entityId: sponsor.id,
    entityName: sponsor.name,
    description: `Deleted sponsor "${sponsor.name}"`,
    request,
  });

  return successResponse({ id: sponsor.id }, "Sponsor deleted successfully");
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "sponsor");
export const PATCH = withErrorHandling(handlePatch, "sponsor");
export const DELETE = withErrorHandling(handleDelete, "sponsor");
