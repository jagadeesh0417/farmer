import { prisma } from "@/lib/prisma";
import ShopContent from "./ShopContent";

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const category = params.category || "all";
  const sort = params.sort || "newest";
  const search = params.search || "";

  let where = {};
  if (category !== "all") where.category = category;
  if (search) where.name = { contains: search };

  let orderBy = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  if (sort === "price-desc") orderBy = { price: "desc" };
  if (sort === "name") orderBy = { name: "asc" };

  const products = await prisma.product.findMany({ where, orderBy });
  const categories = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
  });

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="font-display text-5xl md:text-6xl mb-4">Shop</h1>
        <p className="text-text-muted">{products.length} products</p>
      </div>
      <ShopContent products={products} categories={categories.map(c => c.category)} initialCategory={category} initialSort={sort} />
    </div>
  );
}
