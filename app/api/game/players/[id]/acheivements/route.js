import { z } from "zod";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  successResponse,
  errorResponse,
  logActivity,
  withErrorHandling,
} from "@/lib/api/helpers";
import { defineAbilityFor } from "@/lib/ability";

/* ---------------- ENUM ---------------- */
// TODO: Move to a shared location if used elsewhere
const SportTypeEnum = z.enum([
  "FIELD_HOCKEY",
  "FOOTBALL",
  "CRICKET",
  "RELAY",
  "KABADDI",
  "ATHLETICS",
  "TENNIS",
  "OTHER",
]);

/* ---------------- SCHEMAS ---------------- */

const createAchievementSchema = z.object({
  year: z.string().optional(),
  title: z.string().min(3).max(150),
  description: z.string().max(500).optional(),
});

const updateAchievementSchema = z.object({
  year: z.string().optional().nullable(),
  title: z.string().min(3).max(150).optional(),
  description: z.string().max(500).optional().nullable(),
});

/* ---------------- HELPERS ---------------- */

function getIndexFromRequest(request) {
  const { searchParams } = new URL(request.url);
  const index = Number(searchParams.get("index"));
  return isNaN(index) ? null : index;
}

/* ---------------- HANDLERS ---------------- */

/* ========== CREATE ACHIEVEMENT ========== */
async function handlePost(request, { params }) {
  const setup = await setupApiHandler(request, "achievements:create");
  if (setup.error) return setup.error;

  const ability = defineAbilityFor(setup.user);
  if (!ability.can("create", "Achievement")) {
    return errorResponse("You don't have permission to add achievements", 403);
  }

  const { playerId } = params;

  const player = await db.player.findUnique({
    where: { id: playerId },
    select: { achievements: true, playerName: true },
  });

  if (!player) return errorResponse("Player not found", 404);

  const body = await request.json();
  const validated = createAchievementSchema.parse(body);

  const updatedAchievements = [...(player.achievements || []), validated];

  await db.player.update({
    where: { id: playerId },
    data: { achievements: updatedAchievements },
  });

  await logActivity({
    userId: setup.user.userId,
    action: "created",
    entity: "achievement",
    entityId: playerId,
    entityName: validated.title,
    description: `Added achievement "${validated.title}" to player "${player.playerName}"`,
    request,
  });

  return successResponse(
    updatedAchievements,
    "Achievement added successfully",
    201
  );
}

/* ========== UPDATE ACHIEVEMENT ========== */
async function handlePatch(request, { params }) {
  const setup = await setupApiHandler(request, "achievements:update");
  if (setup.error) return setup.error;

  const ability = defineAbilityFor(setup.user);
  if (!ability.can("update", "Achievement")) {
    return errorResponse(
      "You don't have permission to update achievements",
      403
    );
  }

  const { playerId } = params;
  const index = getIndexFromRequest(request);

  if (index === null) {
    return errorResponse("Achievement index is required", 400);
  }

  const player = await db.player.findUnique({
    where: { id: playerId },
    select: { achievements: true, playerName: true },
  });

  if (!player) return errorResponse("Player not found", 404);

  if (!player.achievements?.[index]) {
    return errorResponse("Achievement not found", 404);
  }

  const body = await request.json();
  const validated = updateAchievementSchema.parse(body);

  const updatedAchievements = [...player.achievements];
  updatedAchievements[index] = {
    ...updatedAchievements[index],
    ...validated,
  };

  await db.player.update({
    where: { id: playerId },
    data: { achievements: updatedAchievements },
  });

  await logActivity({
    userId: setup.user.userId,
    action: "updated",
    entity: "achievement",
    entityId: playerId,
    entityName: updatedAchievements[index].title,
    description: `Updated achievement "${updatedAchievements[index].title}" for player "${player.playerName}"`,
    request,
  });

  return successResponse(
    updatedAchievements[index],
    "Achievement updated successfully"
  );
}

/* ========== DELETE ACHIEVEMENT ========== */
async function handleDelete(request, { params }) {
  const setup = await setupApiHandler(request, "achievements:delete");
  if (setup.error) return setup.error;

  const ability = defineAbilityFor(setup.user);
  if (!ability.can("delete", "Achievement")) {
    return errorResponse(
      "You don't have permission to delete achievements",
      403
    );
  }

  const { playerId } = params;
  const index = getIndexFromRequest(request);

  if (index === null) {
    return errorResponse("Achievement index is required", 400);
  }

  const player = await db.player.findUnique({
    where: { id: playerId },
    select: { achievements: true, playerName: true },
  });

  if (!player) return errorResponse("Player not found", 404);

  if (!player.achievements?.[index]) {
    return errorResponse("Achievement not found", 404);
  }

  const removed = player.achievements[index];
  const updatedAchievements = player.achievements.filter((_, i) => i !== index);

  await db.player.update({
    where: { id: playerId },
    data: { achievements: updatedAchievements },
  });

  await logActivity({
    userId: setup.user.userId,
    action: "deleted",
    entity: "achievement",
    entityId: playerId,
    entityName: removed.title,
    description: `Removed achievement "${removed.title}" from player "${player.playerName}"`,
    request,
  });

  return successResponse(null, "Achievement deleted successfully");
}

/* ---------------- EXPORTS ---------------- */

export const POST = withErrorHandling(handlePost, "achievement");
export const PATCH = withErrorHandling(handlePatch, "achievement");
export const DELETE = withErrorHandling(handleDelete, "achievement");
