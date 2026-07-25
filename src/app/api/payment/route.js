import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request) {
  const body = await request.json();

  if (body.paymentMethod === "cod") {
    return NextResponse.json({ method: "COD", success: true });
  }

  if (body.paymentMethod === "card" || body.paymentMethod === "upi") {
    // In production, initialize Razorpay with actual keys
    // const razorpay = new Razorpay({
    //   key_id: process.env.RAZORPAY_KEY_ID,
    //   key_secret: process.env.RAZORPAY_KEY_SECRET,
    // });
    // const order = await razorpay.orders.create({ ... });
    return NextResponse.json({
      method: body.paymentMethod,
      amount: body.amount,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
      order_id: "order_" + Date.now(),
      success: true,
    });
  }

  return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
}
