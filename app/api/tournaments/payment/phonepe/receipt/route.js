import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const txnId = searchParams.get("txnId");

    if (!txnId) {
      return NextResponse.json(
        { error: "Transaction ID required" },
        { status: 400 },
      );
    }

    // Fetch payment from DB
    const payment = await db.payment.findUnique({
      where: { orderId: txnId },
      include: {
        family: {
          select: { familyName: true },
        },
      },
    });


    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 },
      );
    }

    const date = new Date(payment.createdAt).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const amountFormatted = `₹${payment.amount.toLocaleString("en-IN")}`;

    // Generate PDF as HTML → converted via browser print
    // We return an HTML page that auto-triggers print/save as PDF
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Payment Receipt - ${txnId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; display: flex; justify-content: center; padding: 40px 20px; }
    .receipt { background: white; width: 600px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #5a2d82, #8b5cf6); color: white; padding: 32px; text-align: center; }
    .header h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
    .header p { font-size: 13px; opacity: 0.85; }
    .status-badge { display: inline-block; background: #22c55e; color: white; padding: 6px 20px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-top: 12px; }
    .amount-section { text-align: center; padding: 28px; border-bottom: 1px dashed #e5e7eb; }
    .amount-section .label { font-size: 13px; color: #6b7280; margin-bottom: 6px; }
    .amount-section .amount { font-size: 42px; font-weight: 700; color: #111827; }
    .details { padding: 24px 32px; }
    .row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
    .row:last-child { border-bottom: none; }
    .row .key { font-size: 13px; color: #6b7280; }
    .row .value { font-size: 13px; font-weight: 600; color: #111827; text-align: right; max-width: 60%; word-break: break-all; }
    .footer { background: #f9fafb; padding: 20px 32px; text-align: center; }
    .footer p { font-size: 12px; color: #9ca3af; line-height: 1.6; }
    .btn { display: block; margin: 20px auto 0; background: #5a2d82; color: white; border: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    @media print {
      body { background: white; padding: 0; }
      .receipt { box-shadow: none; border-radius: 0; width: 100%; }
      .btn { display: none; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>Payment Receipt</h1>
      <p>Tournament Registration</p>
      <div class="status-badge">✓ Payment Successful</div>
    </div>

    <div class="amount-section">
      <div class="label">Amount Paid</div>
      <div class="amount">${amountFormatted}</div>
    </div>

    <div class="details">
    <div class="row">
  <span class="key">Order ID</span>
  <span class="value">${payment.orderId}</span>
</div>
<div class="row">
  <span class="key">Payer Name</span>
  <span class="value">${payment.payerName}</span>
</div>
<div class="row">
  <span class="key">Payer Family Name</span>
  <span class="value">${payment.family.familyName}</span>
</div>
<div class="row">
  <span class="key">Phone</span>
  <span class="value">${payment.payerPhone}</span>
</div>
<div class="row">
  <span class="key">Email</span>
  <span class="value">${payment.payerEmail || "—"}</span>
</div>
<div class="row">
  <span class="key">Tournament ID</span>
  <span class="value">${payment.tournamentId}</span>
</div>
<div class="row">
  <span class="key">Date & Time</span>
  <span class="value">${date}</span>
</div>
<div class="row">
  <span class="key">Status</span>
  <span class="value" style="color: #22c55e;">✓ Successful</span>
</div>
    </div>

    <div class="footer">
      <p>This is a computer-generated receipt and does not require a signature.<br/>
      For support, contact us with your Transaction ID.</p>
    </div>

    <button class="btn" onclick="window.print()">⬇ Download / Print Receipt</button>
  </div>

  <script>
    // Auto-trigger print dialog on load (optional)
    // window.onload = () => window.print();
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Receipt error:", error);
    return NextResponse.json(
      { error: "Failed to generate receipt" },
      { status: 500 },
    );
  }
}
