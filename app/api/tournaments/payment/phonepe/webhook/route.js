import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();

    console.log("📨 PhonePe Webhook received:", JSON.stringify(body, null, 2));

    // V2 webhook payload structure
    const { type, payload: eventPayload } = body;

    if (type === "PAYMENT_SUCCESS" || type === "ORDER_COMPLETED") {
      const orderId = eventPayload?.merchantOrderId;
      const state = eventPayload?.state;

      if (orderId) {
        await prisma.payment.update({
          where: { merchantTransactionId: orderId },
          data: { status: state === "COMPLETED" ? "SUCCESS" : state },
        });

        console.log(`✅ Webhook updated payment ${orderId} → ${state}`);
      }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    // Still return 200 so PhonePe doesn't keep retrying
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
