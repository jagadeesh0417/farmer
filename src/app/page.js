import { prisma } from "@/lib/prisma";
import Hero from "@/components/Hero";
import ProductCarousel from "@/components/ProductCarousel";
import CategorySection from "@/components/CategorySection";
import BrandStory from "@/components/BrandStory";
import InstagramFeed from "@/components/InstagramFeed";

export default async function Home() {
  const products = await prisma.product.findMany({
    where: { featured: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <>
      <Hero />
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="font-display text-4xl md:text-5xl">Featured Collection</h2>
          <a href="/shop" className="text-primary hover:underline text-sm tracking-widest uppercase">View All →</a>
        </div>
        <ProductCarousel products={products} />
      </section>
      <CategorySection />
      <BrandStory />
      <InstagramFeed />
    </>
  );
}
