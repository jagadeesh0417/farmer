import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const sort = searchParams.get("sort");
  const search = searchParams.get("search");

  let where = {};
  if (category && category !== "all") where.category = category;
  if (search) where.name = { contains: search };

  let orderBy = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  if (sort === "price-desc") orderBy = { price: "desc" };
  if (sort === "name") orderBy = { name: "asc" };

  const products = await prisma.product.findMany({ where, orderBy });
  return NextResponse.json(products);
}

export async function POST(request) {
  const body = await request.json();
  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"),
      description: body.description,
      price: parseFloat(body.price),
      compareAt: body.compareAt ? parseFloat(body.compareAt) : null,
      category: body.category,
      images: JSON.stringify(body.images || []),
      sizes: JSON.stringify(body.sizes || ["S", "M", "L", "XL", "XXL"]),
      colors: JSON.stringify(body.colors || ["Black", "White", "Blue"]),
      stock: parseInt(body.stock) || 0,
      featured: body.featured || false,
    },
  });
  return NextResponse.json(product, { status: 201 });
}
