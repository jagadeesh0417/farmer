import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const id = parseInt((await params).id);
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(request, { params }) {
  const id = parseInt((await params).id);
  const body = await request.json();
  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description,
      price: body.price ? parseFloat(body.price) : undefined,
      compareAt: body.compareAt ? parseFloat(body.compareAt) : null,
      category: body.category,
      images: body.images ? JSON.stringify(body.images) : undefined,
      sizes: body.sizes ? JSON.stringify(body.sizes) : undefined,
      colors: body.colors ? JSON.stringify(body.colors) : undefined,
      stock: body.stock !== undefined ? parseInt(body.stock) : undefined,
      featured: body.featured !== undefined ? body.featured : undefined,
    },
  });
  return NextResponse.json(product);
}

export async function DELETE(request, { params }) {
  const id = parseInt((await params).id);
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
