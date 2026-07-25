import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("orderNumber");
  const email = searchParams.get("email");

  if (!orderNumber || !email) {
    return NextResponse.json({ error: "orderNumber and email required" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { orderNumber, customerEmail: email },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    customerName: order.customerName,
    total: order.total,
  });
}
