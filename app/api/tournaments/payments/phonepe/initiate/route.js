import { NextResponse } from "next/server";
import { getAccessToken, PHONEPE_HOST } from "../phonepe.js";
import { db } from "@/lib/db.js";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export async function POST(request) {
  try {
    const body = await request.json();
    const { tournamentId, familyId, gameId, registrationDetails, amount } =
      body;

    // Validate required fields
    if (
      !tournamentId ||
      !familyId ||
      !gameId ||
      !amount ||
      !registrationDetails
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (amount <= 0 || amount > 100000) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid amount. Must be between ₹1 and ₹100,000",
        },
        { status: 400 },
      );
    }

    const phone = registrationDetails.phone?.replace(/\D/g, "");
    if (!phone || phone.length < 10) {
      return NextResponse.json(
        { success: false, error: "Valid phone number required" },
        { status: 400 },
      );
    }

    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, ""); // 20260305
    const time = now.getTime().toString().slice(-6); // last 6 digits of timestamp
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3 char random

    const merchantOrderId = `CHENANDA-${date}-${time}-${rand}`;
    const amountInPaise = Math.round(amount * 100);
    const mobileNumber = phone.slice(-10);

    // Get access token
    const accessToken = await getAccessToken();
    // Build V1 payload
    const payload = {
      merchantOrderId,
      amount: amountInPaise,
      expireAfter: 1200, // 20 minutes
      metaInfo: {
        udf1: tournamentId,
        udf2: familyId,
      },
      paymentFlow: {
        type: "PG_CHECKOUT",
        message: "Tournament Registration Payment",
        merchantUrls: {
          redirectUrl: `${APP_URL}/api/tournaments/payment/phonepe/callback?txnId=${merchantOrderId}&tournamentId=${tournamentId}`,
        },
      },
    };

    const phonePeResponse = await fetch(`${PHONEPE_HOST}/checkout/v2/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const phonePeData = await phonePeResponse.json();

    if (!phonePeData.redirectUrl) {
      return NextResponse.json(
        {
          success: false,
          error: phonePeData.message || "Payment initiation failed",
        },
        { status: 400 },
      );
    }

    const redirectUrl =
      phonePeData.redirectUrl || phonePeData.data?.redirectUrl;

    if (!redirectUrl) {
      console.error("No redirect URL in response:", phonePeData);
      return NextResponse.json(
        { success: false, error: "Payment gateway error" },
        { status: 500 },
      );
    }
    const extractedGameId = gameId[0];
    // Save to DB
    await db.payment.create({
      data: {
        orderId: merchantOrderId,
        familyId,
        tournamentId,
        gameId: { connect: { id: extractedGameId } },
        amount,
        status: "PENDING",
        payerName: registrationDetails.name,
        payerEmail: registrationDetails.email,
        payerPhone: mobileNumber,
        orderId: merchantOrderId,
        gameId: gameId,
      },
    });

    

    return NextResponse.json({
      success: true,
      redirectUrl,
      paymentId: merchantOrderId,
      mode: process.env.PHONEPE_ENV,
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
