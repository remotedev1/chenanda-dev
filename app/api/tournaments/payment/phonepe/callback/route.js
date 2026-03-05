import { NextResponse } from "next/server";
import { getAccessToken, PHONEPE_HOST } from "../phonepe.js";
import { db } from "@/lib/db.js";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const txnId = searchParams.get("txnId");
    const tournamentId = searchParams.get("tournamentId");

    if (!txnId) {
      return NextResponse.redirect(`${APP_URL}`);
    }

    // Verify payment status with PhonePe
    const accessToken = await getAccessToken();

    const statusResponse = await fetch(
      `${PHONEPE_HOST}/checkout/v2/order/${txnId}/status`,
      {
        method: "GET",
        headers: {
        "Content-Type": "application/json",
          Authorization: `O-Bearer ${accessToken}`,
        },
      },
    );

    const statusData = await statusResponse.json();
    const paymentState = statusData.state || statusData.data?.state;
    const orderId = statusData.orderId || statusData.data?.orderId || txnId;
    const amount = statusData.amount || statusData.data?.amount;

    // Update DB

    const paymentUpdate = await db.payment.update({
      where: { orderId: txnId },
      data: {
        status: "COMPLETED",
        paymentMethod: statusData.paymentDetails?.paymentMode,
        paymentDate: statusData.paymentDetails?.timestamp,
        feeAmount: statusData.paymentDetails?.feeAmount,
        transactionId: statusData.paymentDetails?.transactionId,
      },
    });

    // 1. Find or create TournamentParticipation
    let participation = await db.tournamentParticipation.findUnique({
      where: {
        tournamentId_familyId: {
          tournamentId,
          familyId: paymentUpdate.familyId,
        },
      },
    });

    if (!participation) {
      participation = await db.tournamentParticipation.create({
        data: {
          tournamentId,
          familyId: paymentUpdate.familyId,
        },
      });
    }

    // 2. Create GameRegistration for each game + link to participation

    await db.gameRegistration.upsert({
      where: {
        gameId_participationId: {
          gameId: paymentUpdate.gameId,
          participationId: participation.id,
        },
      },
      update: {
        paymentStatus: "CONFIRMED",
        participationId: participation.id,
        gameId: paymentUpdate.gameId,
        confirmedAt: new Date(),
      },
      create: {
        gameId: paymentUpdate.gameId,
        participationId: participation.id,
        gameId: paymentUpdate.gameId,
        paymentStatus: "CONFIRMED",
        confirmedAt: new Date(),
      },
    });
    await db.families.update({
      where: { id: paymentUpdate.familyId },
      data: {
        contacts: {
          push: {
            name: paymentUpdate.payerName,
            email: paymentUpdate.payerEmail,
            phone: paymentUpdate.payerPhone,
          },
        },
        payments: {
          connect: {
            id: paymentUpdate.id,
          },
        },
      },
    });

    if (paymentState === "COMPLETED") {
      return NextResponse.redirect(
        `${APP_URL}/payment/success?txnId=${paymentUpdate.orderId}&amount=${amount}&transactionId=${statusData.paymentDetails?.transactionId}`,
      );
    } else {
      return NextResponse.redirect(
        `${APP_URL}/payment/error?txnId=${paymentUpdate.orderId}&reason=${paymentState || "UNKNOWN_ERROR"}`,
      );
    }
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.redirect(
      `${APP_URL}/payment/error?reason=callback_failed`,
    );
  }
}
