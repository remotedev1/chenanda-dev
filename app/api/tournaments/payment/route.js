// app/api/payments/route.js
import { z } from "zod";
import { db } from "@/lib/db";
import {
  setupApiHandler,
  parsePagination,
  buildPaginationResponse,
  buildSearchWhere,
  successResponse,
  errorResponse,
  logActivity,
  withErrorHandling,
} from "@/lib/api/helpers";
import { auth } from "@/auth";

/* ---------------- SCHEMAS ---------------- */

const querySchema = z.object({
  page: z.string().default("1"),
  limit: z.string().default("10"),
  search: z.string().optional(),
  familyId: z.string().optional(),
  tournamentId: z.string().optional(),
  gameId: z.string().optional(),
  sport: z.string().optional(),
  status: z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"]).optional(),
  paymentType: z
    .enum([
      "REGISTRATION",
      "ENTRY",
      "SPONSORSHIP",
      "DONATION",
      "MERCHANDISE",
      "OTHER",
    ])
    .optional(),
  sortBy: z
    .enum(["paymentDate", "amount", "createdAt", "updatedAt", "status"])
    .default("paymentDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const createPaymentSchema = z.object({
  familyId: z.string().min(1, "Family is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  currency: z.string().default("INR"),
  paymentType: z
    .enum([
      "REGISTRATION",
      "ENTRY",
      "SPONSORSHIP",
      "DONATION",
      "MERCHANDISE",
      "OTHER",
    ])
    .optional()
    .nullable(),
  status: z
    .enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"])
    .default("PENDING"),
  description: z.string().max(500).optional().nullable(),
  tournamentId: z.string().optional().nullable(),
  tournamentName: z.string().optional().nullable(),
  sport: z.string().optional().nullable(),
  gameId: z.string().optional().nullable(),
  payerName: z.string().min(1, "Payer name is required"),
  payerEmail: z.string().email("Invalid email").optional().nullable(),
  payerPhone: z.string().min(10, "Phone must be at least 10 digits"),
  payerAltPhone: z.string().optional().nullable(),
  transactionId: z.string().optional().nullable(),
  orderId: z.string().optional().nullable(),
  receiptNumber: z.string().optional().nullable(),
  paymentDate: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .or(z.date())
    .optional()
    .nullable(),
  feeAmount: z.number().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

/* ---------------- HANDLERS ---------------- */

async function handleGet(request) {
  const setup = await setupApiHandler(request, "payments:list");
  if (setup.error) return setup.error;

  const { searchParams } = new URL(request.url);

  const validated = querySchema.parse({
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    search: searchParams.get("search") || undefined,
    familyId: searchParams.get("familyId") || undefined,
    tournamentId: searchParams.get("tournamentId") || undefined,
    gameId: searchParams.get("gameId") || undefined,
    sport: searchParams.get("sport") || undefined,
    status: searchParams.get("status") || undefined,
    paymentType: searchParams.get("paymentType") || undefined,
    sortBy: searchParams.get("sortBy") || undefined,
    sortOrder: searchParams.get("sortOrder") || undefined,
  });

  const { page, limit, skip } = parsePagination(searchParams);

  const where = {
    ...buildSearchWhere(validated.search, [
      "description",
      "notes",
      "payerName",
      "payerEmail",
      "transactionId",
      "orderId",
      "receiptNumber",
    ]),
    ...(validated.familyId && { familyId: validated.familyId }),
    ...(validated.tournamentId && { tournamentId: validated.tournamentId }),
    ...(validated.gameId && { gameId: validated.gameId }),
    ...(validated.sport && { sport: validated.sport }),
    ...(validated.status && { status: validated.status }),
    ...(validated.paymentType && { paymentType: validated.paymentType }),
  };

  const orderBy = (() => {
    const dir = validated.sortOrder;
    switch (validated.sortBy) {
      case "amount":
        return { amount: dir };
      case "createdAt":
        return { createdAt: dir };
      case "updatedAt":
        return { updatedAt: dir };
      case "status":
        return { status: dir };
      default:
        return { paymentDate: dir };
    }
  })();

  const [payments, total] = await Promise.all([
    db.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        family: {
          select: {
            id: true,
            familyName: true,
            contacts: true,
          },
        },
      },
    }),
    db.payment.count({ where }),
  ]);

  return successResponse({
    data: payments,
    ...buildPaginationResponse(page, limit, total, payments),
  });
}

async function handlePost(request) {
  const setup = await setupApiHandler(request, "payments:create");
  if (setup.error) return setup.error;

  const { user } = await auth();
  const body = await request.json();
  const validated = createPaymentSchema.parse(body);

  // Verify family exists
  const family = await db.families.findUnique({
    where: { id: validated.familyId },
    select: { id: true, familyName: true },
  });
  if (!family) {
    return errorResponse("Selected family does not exist", 400);
  }

  // If tournamentId provided, verify it exists
  if (validated.tournamentId) {
    const tournament = await db.tournament.findUnique({
      where: { id: validated.tournamentId },
      select: { id: true, name: true },
    });
    if (!tournament) {
      return errorResponse("Selected tournament does not exist", 400);
    }
  }

  // If gameId provided, verify it exists
  if (validated.gameId) {
    const game = await db.tournamentGame.findUnique({
      where: { id: validated.gameId },
      select: { id: true, name: true },
    });
    if (!game) {
      return errorResponse("Selected game does not exist", 400);
    }
  }

  const payment = await db.payment.create({
    data: {
      familyId: validated.familyId,
      amount: validated.amount,
      currency: validated.currency,
      paymentType: validated.paymentType || null,
      status: validated.status,
      description: validated.description || null,
      tournamentId: validated.tournamentId || null,
      tournamentName: validated.tournamentName || null,
      sport: validated.sport || null,
      gameId: validated.gameId || null,
      payerName: validated.payerName,
      payerEmail: validated.payerEmail || null,
      payerPhone: validated.payerPhone,
      payerAltPhone: validated.payerAltPhone || null,
      transactionId: validated.transactionId || null,
      orderId: validated.orderId || null,
      receiptNumber: validated.receiptNumber || null,
      paymentDate: validated.paymentDate || new Date(),
      feeAmount: validated.feeAmount || null,
      notes: validated.notes || null,
    },
  });

  // Find or create TournamentParticipation
  if (validated.tournamentId && validated.gameId) {
    let participation = await db.tournamentParticipation.findUnique({
      where: {
        tournamentId_familyId: {
          tournamentId: validated.tournamentId,
          familyId: validated.familyId,
        },
      },
    });

    if (!participation) {
      participation = await db.tournamentParticipation.create({
        data: {
          tournamentId: validated.tournamentId,
          familyId: validated.familyId,
        },
      });
    }

    await db.gameRegistration.upsert({
      where: {
        gameId_participationId: {
          gameId: validated.gameId,
          participationId: participation.id,
        },
      },
      update: {
        paymentStatus: "CONFIRMED",
        confirmedAt: new Date(),
      },
      create: {
        gameId: validated.gameId,
        participationId: participation.id,
        paymentStatus: "CONFIRMED",
        confirmedAt: new Date(),
      },
    });
  }

  await db.families.update({
    where: { id: validated.familyId },
    data: {
      contacts: {
        push: {
          name: validated.payerName,
          email: validated.payerEmail,
          phone: validated.payerPhone,
        },
      },
      payments: {
        connect: { id: payment.id },
      },
    },
  });

  await logActivity({
    userId: user.id,
    action: "created",
    entity: "payment",
    entityId: payment.id,
    entityName: `${payment.currency} ${payment.amount.toFixed(2)}`,
    description: `Created payment of ${payment.currency} ${payment.amount.toFixed(2)} for family "${family.familyName}"`,
    request,
  });

  return successResponse(payment, "Payment created successfully", 201);
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "payments");
export const POST = withErrorHandling(handlePost, "payment");
