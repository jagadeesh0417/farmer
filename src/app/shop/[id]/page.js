import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatPrice, parseJsonField } from "@/lib/utils";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductDetail({ params }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
  if (!product) notFound();

  const relatedProducts = await prisma.product.findMany({
    where: { category: product.category, id: { not: product.id } },
    take: 4,
  });

  const images = parseJsonField(product.images, ["/images/placeholder.svg"]);
  const sizes = parseJsonField(product.sizes, ["S", "M", "L", "XL", "XXL"]);

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
      <ProductDetailClient
        product={{ ...product, images, sizes }}
        relatedProducts={relatedProducts}
        formatPrice={formatPrice.toString()}
      />
    </div>
  );
}
