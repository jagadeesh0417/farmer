const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminExists = await prisma.admin.findUnique({ where: { username: "admin" } });
  if (!adminExists) {
    await prisma.admin.create({
      data: {
        username: "admin",
        password: await bcrypt.hash("arhuu123", 12),
      },
    });
    console.log("Admin created: admin / arhuu123");
  }

  const productCount = await prisma.product.count();
  if (productCount === 0) {
    const products = [
      {
        name: "Classic Blue Oxford Shirt",
        slug: "classic-blue-oxford-shirt",
        description: "Premium Oxford cotton shirt with a modern slim fit. Features a button-down collar, chest pocket, and adjustable cuffs. Perfect for both formal occasions and casual outings.",
        price: 1899,
        compareAt: 2499,
        category: "Shirts",
        images: JSON.stringify(["/images/placeholder.svg", "/images/placeholder.svg"]),
        sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
        colors: JSON.stringify(["Blue", "Navy"]),
        stock: 50,
        featured: true,
      },
      {
        name: "Black Premium Polo",
        slug: "black-premium-polo",
        description: "Premium pique cotton polo with a sleek matte finish. Ribbed collar and cuffs, two-button placket, and a tailored fit that flatters every body type.",
        price: 1499,
        compareAt: 1999,
        category: "Polos",
        images: JSON.stringify(["/images/placeholder.svg"]),
        sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
        colors: JSON.stringify(["Black", "White", "Navy"]),
        stock: 35,
        featured: true,
      },
      {
        name: "Slim Fit Casual Shirt - Grey",
        slug: "slim-fit-casual-shirt-grey",
        description: "Lightweight casual shirt in a versatile grey tone. Spread collar, curved hem, and a comfort stretch fabric that moves with you all day.",
        price: 1299,
        compareAt: null,
        category: "Casual Wear",
        images: JSON.stringify(["/images/placeholder.svg"]),
        sizes: JSON.stringify(["M", "L", "XL", "XXL"]),
        colors: JSON.stringify(["Grey", "Charcoal"]),
        stock: 40,
        featured: true,
      },
      {
        name: "White Linen Blend Shirt",
        slug: "white-linen-blend-shirt",
        description: "Breathable linen-cotton blend shirt in crisp white. Perfect for summer weddings, brunches, and vacation styling. Relaxed fit with a spread collar.",
        price: 2199,
        compareAt: 2999,
        category: "Shirts",
        images: JSON.stringify(["/images/placeholder.svg"]),
        sizes: JSON.stringify(["S", "M", "L", "XL"]),
        colors: JSON.stringify(["White"]),
        stock: 25,
        featured: true,
      },
      {
        name: "Navy Blue Slim Polo",
        slug: "navy-blue-slim-polo",
        description: "A timeless navy polo with a modern slim silhouette. Made from combed cotton jersey with a touch of stretch for all-day comfort.",
        price: 1699,
        compareAt: null,
        category: "Polos",
        images: JSON.stringify(["/images/placeholder.svg"]),
        sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
        colors: JSON.stringify(["Navy", "Black"]),
        stock: 30,
        featured: false,
      },
      {
        name: "Maroon Casual Henley",
        slug: "maroon-casual-henley",
        description: "Button-front henley in deep maroon. Heavyweight cotton jersey with a relaxed fit and vintage-inspired detailing. Great for layering or wearing solo.",
        price: 1199,
        compareAt: 1599,
        category: "Casual Wear",
        images: JSON.stringify(["/images/placeholder.svg"]),
        sizes: JSON.stringify(["M", "L", "XL", "XXL"]),
        colors: JSON.stringify(["Maroon", "Black", "Olive"]),
        stock: 45,
        featured: false,
      },
      {
        name: "Checked Formal Shirt - Blue",
        slug: "checked-formal-shirt-blue",
        description: "Sharp checked pattern on a crisp cotton formal shirt. Semi-spread collar, double cuffs, and a darted fit for a polished office look.",
        price: 1999,
        compareAt: 2599,
        category: "Shirts",
        images: JSON.stringify(["/images/placeholder.svg"]),
        sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
        colors: JSON.stringify(["Blue"]),
        stock: 20,
        featured: true,
      },
      {
        name: "Khaki Utility Shirt",
        slug: "khaki-utility-shirt",
        description: "Utility-inspired shirt in khaki with dual chest pockets and epaulettes. Durable twill fabric that looks better with age.",
        price: 1799,
        compareAt: null,
        category: "Casual Wear",
        images: JSON.stringify(["/images/placeholder.svg"]),
        sizes: JSON.stringify(["M", "L", "XL", "XXL"]),
        colors: JSON.stringify(["Khaki", "Olive"]),
        stock: 15,
        featured: false,
      },
    ];

    for (const product of products) {
      await prisma.product.create({ data: product });
    }
    console.log(`Seeded ${products.length} products`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
