import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  const id = parseInt((await params).id);
  const body = await request.json();
  const order = await prisma.order.update({
    where: { id },
    data: {
      orderStatus: body.orderStatus,
      paymentStatus: body.paymentStatus,
    },
  });
  return NextResponse.json(order);
}
