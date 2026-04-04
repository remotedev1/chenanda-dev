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
  limit: z.string().default("1000"),
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
  gameIds: z.array(z.string()).default([]),
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

const updatePaymentSchema = createPaymentSchema.partial();

const bulkPaymentSchema = z.object({
  bulk: z.literal(true),
  payments: z
    .array(createPaymentSchema)
    .min(1, "At least one payment required"),
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
        game: {
          select: {
            id: true,
            name: true,
            icon: true,
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

async function handlePut(request, { params }) {
  const setup = await setupApiHandler(request, "payments:update");
  if (setup.error) return setup.error;

  const { user } = await auth();
  const { paymentId } = params;
  const body = await request.json();

  // Validate body
  const validated = updatePaymentSchema.parse(body);

  // If tournamentId provided, verify it exists
  if (validated.tournamentId) {
    const tournament = await db.tournament.findUnique({
      where: { id: validated.tournamentId },
      select: { id: true },
    });
    if (!tournament) {
      return errorResponse("Selected tournament does not exist", 400);
    }
  }

  // If gameId provided, verify it exists
  if (validated.gameIds.length > 0) {
    const games = await db.tournamentGame.findMany({
      where: { id: { in: validated.gameIds } },
      select: { id: true },
    });
    if (games.length !== validated.gameIds.length) {
      return errorResponse("One or more selected games do not exist", 400);
    }
  }

  // Check payment exists for this family
  const existingPayment = await db.payment.findFirst({
    where: { id: paymentId },
  });

  if (!existingPayment) {
    return errorResponse("No payment found for this family", 404);
  }

  const payment = await db.payment.update({
    where: { id: existingPayment.id },
    data: {
      amount: validated.amount,
      currency: validated.currency,
      paymentType: validated.paymentType || null,
      status: validated.status,
      description: validated.description || null,
      tournamentId: validated.tournamentId || null,
      tournamentName: validated.tournamentName || null,
      sport: validated.sport || null,
      gameIds: validated.gameIds || [],
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
      updatedAt: new Date(),
    },
  });

  await logActivity({
    userId: user.id,
    action: "updated",
    entity: "payment",
    entityId: payment.id,
    entityName: `${payment.currency} ${payment.amount.toFixed(2)}`,
    description: `Updated payment of ${payment.currency} ${payment.amount.toFixed(2)} for family "${existingPayment.id} familyId}"`,
    request,
  });

  return successResponse(payment, "Payment updated successfully");
}

/* ---------------- EXPORTS ---------------- */

export const GET = withErrorHandling(handleGet, "payments");
export const PUT = withErrorHandling(handlePut, "payments");
