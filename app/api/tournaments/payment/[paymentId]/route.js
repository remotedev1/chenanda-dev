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

async function handlePost(request) {
  const setup = await setupApiHandler(request, "payments:create");
  if (setup.error) return setup.error;

  const { user } = await auth();
  const body = await request.json();

  // Check if bulk payment
  if (body.bulk === true) {
    const validated = bulkPaymentSchema.parse(body);

    // Verify family exists
    const family = await db.families.findUnique({
      where: { id: validated.payments[0].familyId },
      select: { id: true, familyName: true },
    });
    if (!family) {
      return errorResponse("Selected family does not exist", 400);
    }

    // Create all payments
    const createdPayments = await Promise.all(
      validated.payments.map((paymentData) =>
        db.payment.create({
          data: {
            familyId: paymentData.familyId,
            amount: paymentData.amount,
            currency: paymentData.currency,
            paymentType: paymentData.paymentType || null,
            status: paymentData.status,
            description: paymentData.description || null,
            tournamentId: paymentData.tournamentId || null,
            tournamentName: paymentData.tournamentName || null,
            sport: paymentData.sport || null,
            gameId: paymentData.gameId || null,
            payerName: paymentData.payerName,
            payerEmail: paymentData.payerEmail || null,
            payerPhone: paymentData.payerPhone,
            payerAltPhone: paymentData.payerAltPhone || null,
            transactionId: paymentData.transactionId || null,
            orderId: paymentData.orderId || null,
            receiptNumber: paymentData.receiptNumber || null,
            paymentDate: paymentData.paymentDate || new Date(),
            feeAmount: paymentData.feeAmount || null,
            notes: paymentData.notes || null,
          },
        }),
      ),
    );

    // Update family contacts if needed
    const existingContacts = await db.families.findUnique({
      where: { id: family.id },
      select: { contacts: true },
    });

    const contacts = existingContacts?.contacts || [];
    const contactExists = contacts.some(
      (c) => c.phone === validated.payments[0].payerPhone,
    );

    if (!contactExists) {
      await db.families.update({
        where: { id: family.id },
        data: {
          contacts: {
            push: {
              name: validated.payments[0].payerName,
              email: validated.payments[0].payerEmail,
              phone: validated.payments[0].payerPhone,
            },
          },
        },
      });
    }

    await logActivity({
      userId: user.id,
      action: "created",
      entity: "payment",
      entityId: createdPayments[0].id,
      entityName: `Bulk payment for ${family.familyName}`,
      description: `Created ${createdPayments.length} payment(s) totaling ${validated.payments[0].currency} ${createdPayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)} for family "${family.familyName}"`,
      request,
    });

    return successResponse(
      createdPayments,
      `${createdPayments.length} payment(s) created successfully`,
      201,
    );
  }

  // Single payment
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

  // Update family contacts if needed
  const existingContacts = await db.families.findUnique({
    where: { id: family.id },
    select: { contacts: true },
  });

  const contacts = existingContacts?.contacts || [];
  const contactExists = contacts.some((c) => c.phone === validated.payerPhone);

  if (!contactExists) {
    await db.families.update({
      where: { id: family.id },
      data: {
        contacts: {
          push: {
            name: validated.payerName,
            email: validated.payerEmail,
            phone: validated.payerPhone,
          },
        },
      },
    });
  }

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
