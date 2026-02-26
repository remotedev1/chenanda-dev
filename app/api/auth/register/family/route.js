import { z } from "zod";
import bcryptjs from "bcryptjs";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  successResponse,
  errorResponse,
  logActivity,
  withErrorHandling,
} from "@/lib/api/helpers";

/* ---------------- SCHEMAS ---------------- */

const registerSchema = z.object({
  phoneNumber: z.string().min(10),
  otp: z.string().length(6),
  tournamentId: z.string().min(1),
  familyId: z.string().min(1),
  userData: z
    .object({
      firstName: z.string().min(2),
      lastName: z.string().optional(),
      email: z.string().email().optional(),
    })
    .optional(),
  gameRegistrations: z.array(z.string()), // Array of game IDs
});

/* ---------------- HANDLERS ---------------- */

async function handlePost(request) {
  // Setup (rate limit only)
  const setup = await setupApiHandler(request, "tournament:register");
  if (setup.error) return setup.error;

  // Parse and validate body
  const body = await request.json();
  const validated = registerSchema.parse(body);

  const normalizedPhone = validated.phoneNumber.trim();

  // Verify OTP one more time
  const user = await db.user.findFirst({
    where: {
      phoneNumber: normalizedPhone,
      phoneOtp: validated.otp,
    },
  });

  // Check if user exists
  let userId;
  let isNewUser = false;

  if (!user && validated.userData) {
    // Create new user
    const hashedPassword = await bcryptjs.hash(
      crypto.randomBytes(16).toString("hex"),
      12
    ); // Random password

    const newUser = await db.user.create({
      data: {
        firstName: validated.userData.firstName,
        lastName: validated.userData.lastName || "",
        email: validated.userData.email || `${normalizedPhone}@temp.com`,
        phoneNumber: normalizedPhone,
        password: hashedPassword,
        phoneVerified: new Date(),
        familyId: validated.familyId,
        role: "USER",
        isActive: true,
        isBlocked: false,
        images: [],
      },
    });

    userId = newUser.id;
    isNewUser = true;
  } else if (user) {
    // Update existing user with family if not set
    if (!user.familyId && validated.familyId) {
      await db.user.update({
        where: { id: user.id },
        data: { familyId: validated.familyId },
      });
    }
    userId = user.id;
  } else {
    return errorResponse("User verification failed", 401);
  }

  // Check if tournament exists
  const tournament = await db.tournament.findUnique({
    where: { id: validated.tournamentId },
  });

  if (!tournament) {
    return errorResponse("Tournament not found", 404);
  }

  // Check if family exists
  const family = await db.families.findUnique({
    where: { id: validated.familyId },
  });

  if (!family) {
    return errorResponse("Family not found", 404);
  }

  // Check if already registered
  const existingParticipation = await db.tournamentParticipation.findFirst({
    where: {
      tournamentId: validated.tournamentId,
      familyId: validated.familyId,
    },
  });

  if (existingParticipation) {
    return errorResponse(
      "Family is already registered for this tournament",
      409
    );
  }

  // Fetch selected games and calculate total
  const games = await db.tournamentGame.findMany({
    where: {
      id: { in: validated.gameRegistrations },
      tournamentId: validated.tournamentId,
      isActive: true,
    },
  });

  if (games.length !== validated.gameRegistrations.length) {
    return errorResponse("Some selected games are not available", 400);
  }

  const totalAmount = games.reduce((sum, game) => sum + game.registrationFee, 0);

  // Create tournament participation
  const participation = await db.tournamentParticipation.create({
    data: {
      tournamentId: validated.tournamentId,
      familyId: validated.familyId,
      registeredBy: userId,
      registeredVia: "PHONE",
      totalAmountPaid: 0, // Will be updated after payment
    },
  });

  // Create game registrations
  const gameRegistrations = await Promise.all(
    games.map((game) =>
      db.gameRegistration.create({
        data: {
          gameId: game.id,
          participationId: participation.id,
          paymentStatus: "PENDING",
          paymentAmount: game.registrationFee,
          status: "PENDING",
        },
      })
    )
  );

  // Log activity
  await logActivity({
    userId,
    action: "registered",
    entity: "tournament_participation",
    entityId: participation.id,
    entityName: `${family.familyName} - ${tournament.name}`,
    description: `Registered ${family.familyName} for ${tournament.name}`,
    request,
  });

  return successResponse(
    {
      userId,
      participationId: participation.id,
      isNewUser,
      gamesRegistered: gameRegistrations.length,
      totalAmount,
      paymentRequired: true,
    },
    "Registration completed successfully",
    201
  );
}

/* ---------------- EXPORTS ---------------- */

export const POST = withErrorHandling(handlePost, "tournament-register");