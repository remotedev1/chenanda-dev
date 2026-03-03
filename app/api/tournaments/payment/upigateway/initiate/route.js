// app/api/tournaments/payment/upigateway/initiate/route.js

import { NextResponse } from "next/server";

/**
 * UPIGATEWAY.com Payment Initiation
 *
 * This endpoint:
 * 1. Creates a payment record in your database
 * 2. Initiates payment with UPIGATEWAY.com
 * 3. Returns payment URL for user redirection
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "tournamentId",
      "familyId",
      "gameIds",
      "registrationDetails",
      "amount",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    // Validate amount
    if (body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 },
      );
    }

    // 1. Create payment record in database
    // Replace this with your actual database logic
    const payment = await createPaymentRecord({
      tournamentId: body.tournamentId,
      familyId: body.familyId,
      gameIds: body.gameIds,
      amount: body.amount,
      status: "PENDING",
      paymentMethod: "UPI",
      metadata: {
        registrationDetails: body.registrationDetails,
        games: body.gameIds,
      },
    });

    // 2. Generate unique order ID
    const orderId = `TRN_${body.tournamentId}_${payment.id}_${Date.now()}`;

    // 3. Call UPIGATEWAY.com API
    const upiGatewayResponse = await fetch(
      `${process.env.UPI_GATEWAY_BASE_URL}/api/v1/payments/create`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.UPIGATEWAY_API_KEY}`,
          "Content-Type": "application/json",
          "X-Merchant-Id": process.env.UPIGATEWAY_MERCHANT_ID,
        },
        body: JSON.stringify({
          // Payment details
          amount: body.amount * 100, // Convert to paise (₹100 = 10000 paise)
          currency: "INR",
          orderId: orderId,

          // Customer details
          customer: {
            name: body.registrationDetails.name,
            email: body.registrationDetails.email,
            phone: body.registrationDetails.phone,
          },

          // URLs
          returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/tournaments/${body.tournamentId}/payment/payment-callback`,
          webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/upigateway`,

          // Metadata
          metadata: {
            tournamentId: body.tournamentId,
            familyId: body.familyId,
            paymentId: payment.id,
            familyName: body.registrationDetails.name,
          },

          // Payment options
          paymentMethods: ["UPI"],
          description: `Tournament Registration - ${body.gameIds.length} game(s)`,
        }),
      },
    );

    if (!upiGatewayResponse.ok) {
      const errorData = await upiGatewayResponse.json();
      console.error("UPIGATEWAY API Error:", errorData);

      // Update payment status to failed
      await updatePaymentStatus(payment.id, "FAILED", {
        error: errorData.message || "UPIGATEWAY initiation failed",
      });

      return NextResponse.json(
        {
          success: false,
          error: "Payment gateway error. Please try again.",
        },
        { status: 500 },
      );
    }

    const upiData = await upiGatewayResponse.json();

    // 4. Update payment record with gateway details
    await updatePaymentRecord(payment.id, {
      gatewayOrderId: upiData.orderId || orderId,
      gatewayTransactionId: upiData.transactionId,
      gatewayPaymentId: upiData.paymentId,
    });

    // 5. Create registration entries (optional - can be done after payment confirmation)
    // This creates the registration record but marks it as unpaid
    await createTournamentRegistrations({
      tournamentId: body.tournamentId,
      familyId: body.familyId,
      gameIds: body.gameIds,
      paymentId: payment.id,
      status: "PENDING_PAYMENT",
      registrationDetails: body.registrationDetails,
    });

    // 6. Return payment URL for redirection
    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      paymentUrl: upiData.paymentUrl, // User will be redirected here
      orderId: orderId,
    });
  } catch (error) {
    console.error("Payment initiation error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again.",
      },
      { status: 500 },
    );
  }
}

// Database helper functions (implement based on your DB)
async function createPaymentRecord(data) {
  // Example with Prisma
  /*
  return await prisma.payment.create({
    data: {
      tournamentId: data.tournamentId,
      familyId: data.familyId,
      amount: data.amount,
      status: data.status,
      paymentMethod: data.paymentMethod,
      metadata: data.metadata,
    }
  });
  */

  // Replace with your database logic
  return {
    id: `PAY_${Date.now()}`,
    ...data,
  };
}

async function updatePaymentRecord(paymentId, data) {
  // Example with Prisma
  /*
  return await prisma.payment.update({
    where: { id: paymentId },
    data: data,
  });
  */

  // Replace with your database logic
  console.log("Update payment:", paymentId, data);
}

async function updatePaymentStatus(paymentId, status, metadata = {}) {
  // Example with Prisma
  /*
  return await prisma.payment.update({
    where: { id: paymentId },
    data: { 
      status,
      metadata: {
        ...metadata
      }
    },
  });
  */

  // Replace with your database logic
  console.log("Update payment status:", paymentId, status, metadata);
}

async function createTournamentRegistrations(data) {
  // Example with Prisma
  /*
  const registrations = data.gameIds.map(gameId => ({
    tournamentId: data.tournamentId,
    familyId: data.familyId,
    gameId: gameId,
    paymentId: data.paymentId,
    status: data.status,
    contactDetails: data.registrationDetails,
  }));
  
  return await prisma.tournamentRegistration.createMany({
    data: registrations,
  });
  */

  // Replace with your database logic
  console.log("Create registrations:", data);
}
