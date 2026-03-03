// app/api/webhooks/upigateway/route.js

import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * UPIGATEWAY.com Webhook Handler
 *
 * This endpoint receives payment status updates from UPIGATEWAY.com
 * IMPORTANT: Always verify webhook signature before processing
 */
export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-upigateway-signature");

    // 1. Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 },
      );
    }

    // 2. Parse webhook data
    const webhookData = JSON.parse(body);

    console.log("UPIGATEWAY Webhook received:", {
      event: webhookData.event,
      orderId: webhookData.orderId,
      status: webhookData.status,
    });

    // 3. Handle different webhook events
    switch (webhookData.event) {
      case "payment.success":
        await handlePaymentSuccess(webhookData);
        break;

      case "payment.failed":
        await handlePaymentFailed(webhookData);
        break;

      case "payment.pending":
        await handlePaymentPending(webhookData);
        break;

      default:
        console.log("Unhandled webhook event:", webhookData.event);
    }

    // 4. Acknowledge webhook receipt
    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

/**
 * Verify UPIGATEWAY webhook signature
 */
function verifyWebhookSignature(payload, signature) {
  // IMPORTANT: Replace with actual UPIGATEWAY signature verification
  // This is typically: HMAC-SHA256 of payload using webhook secret

  const webhookSecret = process.env.UPI_GATEWAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("UPIGATEWAY_WEBHOOK_SECRET not configured");
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature || ""),
    Buffer.from(expectedSignature),
  );
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(data) {
  const { orderId, transactionId, amount, metadata, paymentMethod, paidAt } =
    data;

  try {
    // 1. Update payment status in database
    await updatePaymentStatus(metadata.paymentId, "COMPLETED", {
      gatewayTransactionId: transactionId,
      gatewayOrderId: orderId,
      paidAt: paidAt,
      paymentMethod: paymentMethod,
      amountPaid: amount / 100, // Convert from paise to rupees
    });

    // 2. Activate tournament registrations
    await activateTournamentRegistrations({
      paymentId: metadata.paymentId,
      tournamentId: metadata.tournamentId,
      familyId: metadata.familyId,
    });

    // 3. Send confirmation notifications
    await sendConfirmationNotifications({
      paymentId: metadata.paymentId,
      tournamentId: metadata.tournamentId,
      familyId: metadata.familyId,
      familyName: metadata.familyName,
      amount: amount / 100,
      transactionId: transactionId,
    });

    console.log("Payment success processed:", {
      paymentId: metadata.paymentId,
      transactionId,
      amount: amount / 100,
    });
  } catch (error) {
    console.error("Error processing payment success:", error);
    // Consider implementing retry logic or alerting
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(data) {
  const { orderId, transactionId, metadata, failureReason } = data;

  try {
    // Update payment status
    await updatePaymentStatus(metadata.paymentId, "FAILED", {
      gatewayTransactionId: transactionId,
      gatewayOrderId: orderId,
      failureReason: failureReason,
    });

    // Update registrations to failed
    await updateRegistrationStatus(metadata.paymentId, "PAYMENT_FAILED");

    // Optionally notify user
    await sendFailureNotification({
      familyName: metadata.familyName,
      reason: failureReason,
    });

    console.log("Payment failure processed:", {
      paymentId: metadata.paymentId,
      reason: failureReason,
    });
  } catch (error) {
    console.error("Error processing payment failure:", error);
  }
}

/**
 * Handle pending payment
 */
async function handlePaymentPending(data) {
  const { orderId, transactionId, metadata } = data;

  try {
    // Update payment status
    await updatePaymentStatus(metadata.paymentId, "PROCESSING", {
      gatewayTransactionId: transactionId,
      gatewayOrderId: orderId,
    });

    console.log("Payment pending processed:", {
      paymentId: metadata.paymentId,
    });
  } catch (error) {
    console.error("Error processing payment pending:", error);
  }
}

// Database helper functions
async function updatePaymentStatus(paymentId, status, metadata = {}) {
  // Example with Prisma
  /*
  return await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status,
      ...metadata,
      updatedAt: new Date(),
    },
  });
  */

  console.log("Update payment status:", paymentId, status, metadata);
}

async function activateTournamentRegistrations(data) {
  // Example with Prisma
  /*
  return await prisma.tournamentRegistration.updateMany({
    where: {
      paymentId: data.paymentId,
    },
    data: {
      status: 'CONFIRMED',
      confirmedAt: new Date(),
    },
  });
  */

  console.log("Activate registrations:", data);
}

async function updateRegistrationStatus(paymentId, status) {
  // Example with Prisma
  /*
  return await prisma.tournamentRegistration.updateMany({
    where: { paymentId },
    data: { status },
  });
  */

  console.log("Update registration status:", paymentId, status);
}

async function sendConfirmationNotifications(data) {
  // Implement email/SMS notifications
  console.log("Send confirmation notifications:", data);

  // Example: Send email
  /*
  await sendEmail({
    to: data.email,
    subject: 'Tournament Registration Confirmed',
    template: 'registration-confirmation',
    data: {
      familyName: data.familyName,
      amount: data.amount,
      transactionId: data.transactionId,
    },
  });
  */

  // Example: Send SMS
  /*
  await sendSMS({
    to: data.phone,
    message: `Your tournament registration is confirmed. Transaction ID: ${data.transactionId}`,
  });
  */
}

async function sendFailureNotification(data) {
  console.log("Send failure notification:", data);
}
