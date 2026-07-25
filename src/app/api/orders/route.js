import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateOrderNumber } from "@/lib/utils";

export async function GET() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(orders);
}

export async function POST(request) {
  const body = await request.json();
  const orderNumber = generateOrderNumber();
  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      shippingAddress: body.shippingAddress,
      city: body.city,
      state: body.state,
      pincode: body.pincode,
      items: JSON.stringify(body.items),
      subtotal: body.subtotal,
      shipping: body.shipping || 0,
      total: body.total,
      paymentMethod: body.paymentMethod,
      paymentStatus: "pending",
      orderStatus: "placed",
    },
  });
  return NextResponse.json(order, { status: 201 });
}
