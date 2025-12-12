const { PrismaClient } = require("@prisma/client");

// Use DIRECT_URL for seeding (bypasses pooler and Optimize extension)
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_ZtgoY0kIhR1C@ep-polished-wind-a44lwk8r.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=requirey",
    },
  },
});

async function main() {
  console.log("ðŸŒ± Starting seed for PakCards Gift Card Marketplace...\n");

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log("ðŸ—‘ï¸  Clearing existing data...");
  await prisma.deliveredCode.deleteMany({});
  await prisma.rating.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("âœ… Cleared existing data\n");

  // Create test users
  console.log("ðŸ‘¥ Creating users...");

  // Store Owner 1
  const owner1 = await prisma.user.create({
    data: {
      id: "user_owner_001",
      name: "Ahmed Khan",
      email: "ahmed@pakcards.com",
      image: "https://i.pravatar.cc/150?img=12",
    },
  });

  // Store Owner 2
  const owner2 = await prisma.user.create({
    data: {
      id: "user_owner_002",
      name: "Sara Ali",
      email: "sara@giftcards.pk",
      image: "https://i.pravatar.cc/150?img=5",
    },
  });

  // Customers
  const customer1 = await prisma.user.create({
    data: {
      id: "user_customer_001",
      name: "Hassan Raza",
      email: "hassan@example.com",
      image: "https://i.pravatar.cc/150?img=33",
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      id: "user_customer_002",
      name: "Ayesha Malik",
      email: "ayesha@example.com",
      image: "https://i.pravatar.cc/150?img=10",
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      id: "user_customer_003",
      name: "Ali Imran",
      email: "ali@example.com",
      image: "https://i.pravatar.cc/150?img=15",
    },
  });

  console.log(`âœ… Created ${5} users (2 owners, 3 customers)\n`);

  // Create stores
  console.log("ðŸª Creating stores...");

  const store1 = await prisma.store.create({
    data: {
      userId: owner1.id,
      name: "PakCards Official",
      username: "pakcards-official",
      description:
        "Your trusted source for digital gift cards in Pakistan. Instant delivery and best prices!",
      address: "Clifton, Karachi, Pakistan",
      logo: "https://via.placeholder.com/200/4CAF50/FFFFFF?text=PakCards",
      email: "support@pakcards.com",
      contact: "+92-300-1234567",
      status: "approved",
    },
  });

  const store2 = await prisma.store.create({
    data: {
      userId: owner2.id,
      name: "GiftCards Hub",
      username: "giftcards-hub",
      description:
        "Premium gift cards for gaming, entertainment, and shopping. Fast and secure delivery!",
      address: "Gulberg, Lahore, Pakistan",
      logo: "https://via.placeholder.com/200/2196F3/FFFFFF?text=GiftHub",
      email: "info@giftcardshub.pk",
      contact: "+92-321-9876543",
      status: "approved",
    },
  });

  // Pending store (for testing admin approval) - Hassan wants to become a seller
  const store3 = await prisma.store.create({
    data: {
      userId: customer1.id,
      name: "New Seller Store",
      username: "new-seller-2024",
      description: "Just starting out with gift cards!",
      address: "Islamabad, Pakistan",
      logo: "https://via.placeholder.com/200/FF9800/FFFFFF?text=New",
      email: "new@seller.com",
      contact: "+92-345-5555555",
      status: "pending",
    },
  });

  console.log(`âœ… Created ${3} stores (2 approved, 1 pending)\n`);

  // Create coupons
  console.log("ðŸŽŸï¸  Creating coupons...");

  const coupon1 = await prisma.coupon.create({
    data: {
      code: "WELCOME10",
      description: "10% off on your first purchase",
      discount: 10,
      forNewUser: true,
      forMember: false,
      isPublic: true,
      expiresAt: new Date("2025-12-31"),
    },
  });

  const coupon2 = await prisma.coupon.create({
    data: {
      code: "SAVE200",
      description: "â‚¨200 flat discount",
      discount: 200,
      forNewUser: false,
      forMember: true,
      isPublic: true,
      expiresAt: new Date("2025-11-30"),
    },
  });

  console.log(`âœ… Created 2 active coupons\n`);

  // Sample gift card codes for different products
  const steamCodes = [
    "STEAM-1000-XXXX-YYYY-ZZZZ",
    "STEAM-1000-AAAA-BBBB-CCCC",
    "STEAM-1000-DDDD-EEEE-FFFF",
  ];
  const playstationCodes = [
    "PSN-5000-XXXX-YYYY-ZZZZ",
    "PSN-5000-AAAA-BBBB-CCCC",
  ];
  const netflixCodes = [
    "NETFLIX-500-XXXX-YYYY",
    "NETFLIX-500-AAAA-BBBB",
    "NETFLIX-500-CCCC-DDDD",
    "NETFLIX-500-EEEE-FFFF",
  ];
  const amazonCodes = ["AMZN-10000-XXXX-YYYY-ZZZZ"];
  const spotifyCodes = ["SPOTIFY-300-XXXX-YYYY", "SPOTIFY-300-AAAA-BBBB"];
  const googlePlayCodes = [
    "GPLAY-2000-XXXX-YYYY-ZZZZ",
    "GPLAY-2000-AAAA-BBBB-CCCC",
    "GPLAY-2000-DDDD-EEEE-FFFF",
  ];

  // Create gift card products
  console.log("ðŸŽ® Creating gift card products...");

  const products = [
    {
      storeId: store1.id,
      name: "Steam Wallet â‚¨1000",
      description:
        "â‚¨1000 Steam Wallet Code - Instant delivery within 10 minutes after payment verification. Use to purchase games, software, and other content on Steam platform.",
      mrp: 1200,
      price: 1000,
      category: "gaming",
      images: [
        "https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg",
      ],
      deliveryType: "instant",
      digitalCodes: JSON.stringify(steamCodes.map(code => ({code, used: false, orderId: null}))),
      availableCodes: steamCodes.length,
      inStock: true,
    },
    {
      storeId: store1.id,
      name: "PlayStation Store â‚¨5000",
      description:
        "â‚¨5000 PlayStation Store Gift Card - Manual verification. Can be used to purchase games, add-ons, and subscriptions on PlayStation Store.",
      mrp: 5500,
      price: 5000,
      category: "gaming",
      images: [
        "https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg",
      ],
      deliveryType: "manual",
      digitalCodes: JSON.stringify(playstationCodes.map(code => ({code, used: false, orderId: null}))),
      availableCodes: playstationCodes.length,
      inStock: true,
    },
    {
      storeId: store2.id,
      name: "Netflix Premium â‚¨500/Month",
      description:
        "Netflix Premium 1 Month Subscription Code - Instant delivery. Enjoy unlimited movies and TV shows on 4 screens in Ultra HD.",
      mrp: 600,
      price: 500,
      category: "entertainment",
      images: [
        "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
      ],
      deliveryType: "instant",
      digitalCodes: JSON.stringify(netflixCodes.map(code => ({code, used: false, orderId: null}))),
      availableCodes: netflixCodes.length,
      inStock: true,
    },
    {
      storeId: store2.id,
      name: "Amazon Gift Card â‚¨10000",
      description:
        "â‚¨10,000 Amazon Gift Card - Can be used to purchase any products on Amazon.com.",
      mrp: 10500,
      price: 10000,
      category: "shopping",
      images: [
        "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
      ],
      deliveryType: "manual",
      digitalCodes: JSON.stringify(amazonCodes.map(code => ({code, used: false, orderId: null}))),
      availableCodes: amazonCodes.length,
      inStock: true,
    },
    {
      storeId: store1.id,
      name: "Spotify Premium â‚¨300/Month",
      description:
        "Spotify Premium 1 Month Code - Instant delivery. Ad-free music, offline listening, and unlimited skips.",
      mrp: 350,
      price: 300,
      category: "entertainment",
      images: [
        "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
      ],
      deliveryType: "instant",
      digitalCodes: JSON.stringify(spotifyCodes.map(code => ({code, used: false, orderId: null}))),
      availableCodes: spotifyCodes.length,
      inStock: true,
    },
    {
      storeId: store2.id,
      name: "Google Play â‚¨2000",
      description:
        "â‚¨2000 Google Play Gift Card - Instant delivery. Use for apps, games, music, movies, and more on Google Play Store.",
      mrp: 2200,
      price: 2000,
      category: "shopping",
      images: [
        "https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg",
      ],
      deliveryType: "instant",
      digitalCodes: JSON.stringify(googlePlayCodes.map(code => ({code, used: false, orderId: null}))),
      availableCodes: googlePlayCodes.length,
      inStock: true,
    },
  ];

  const createdProducts = [];
  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData,
    });
    createdProducts.push(product);

    const deliveryBadge =
      product.deliveryType === "instant" ? "âš¡ Instant" : "ï¿½ Manual";
    console.log(
      `âœ… ${product.name} - â‚¨${product.price} - ${deliveryBadge} - ${product.availableCodes} codes`
    );
  }
  console.log(`\nâœ… Created ${createdProducts.length} products\n`);

  console.log("\nâœ¨ Seeding completed successfully!");
  console.log("\nðŸ“Š Summary:");
  console.log(`   - 5 users (2 sellers, 3 customers)`);
  console.log(`   - 3 stores (2 approved, 1 pending)`);
  console.log(`   - 2 active coupons (WELCOME10, SAVE200)`);
  console.log(`   - 6 products with gift card codes`);
  console.log(
    "\nðŸš€ Ready to test all 23 API endpoints and 6 Inngest functions!\n"
  );
  console.log("ðŸ’¡ Note: Orders and ratings can be created through the APIs for testing.\n");
}


main().catch((e) => {console.error(' Error seeding database:', e);process.exit(1);}).finally(async () => {await prisma.$disconnect();});
