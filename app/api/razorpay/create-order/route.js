import Razorpay from "razorpay";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// For Next.js 13+ App Router, use this format instead:
export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, currency, receipt, notes } = body;

    if (!amount || amount <= 0) {
      return Response.json({ error: "Invalid amount" }, { status: 400 });
    }

    const options = {
      amount: amount,
      currency: currency || "INR",
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    };

    const order = await razorpay.orders.create(options);
    console.log("Order created:", order.id);

    return Response.json(order, { status: 200 });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return Response.json(
      { error: "Failed to create order", message: error.message },
      { status: 500 }
    );
  }
}
