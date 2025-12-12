const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Create Regions
  console.log("📍 Creating regions...");
  const regions = [
    {
      code: "USA",
      name: "United States",
      flag: "🇺🇸",
      currency: "USD",
      order: 1,
      isActive: true,
    },
    {
      code: "UK",
      name: "United Kingdom",
      flag: "🇬🇧",
      currency: "GBP",
      order: 2,
      isActive: true,
    },
    {
      code: "UAE",
      name: "United Arab Emirates",
      flag: "🇦🇪",
      currency: "AED",
      order: 3,
      isActive: true,
    },
    {
      code: "KSA",
      name: "Saudi Arabia",
      flag: "🇸🇦",
      currency: "SAR",
      order: 4,
      isActive: true,
    },
  ];

  const createdRegions = {};
  for (const regionData of regions) {
    const region = await prisma.region.upsert({
      where: { code: regionData.code },
      update: regionData,
      create: regionData,
    });
    createdRegions[regionData.code] = region;
    console.log(`✅ Region created: ${region.name} (${region.flag})`);
  }

  // 2. Create Categories
  console.log("\n📂 Creating categories...");
  const categories = [
    {
      slug: "playstation",
      name: "PlayStation",
      emoji: "🎮",
      description: "PSN Gift Cards",
      gradient: "from-blue-500 to-indigo-600",
      order: 1,
    },
    {
      slug: "xbox",
      name: "XBox",
      emoji: "🎯",
      description: "XBox Gift Cards",
      gradient: "from-green-500 to-emerald-600",
      order: 2,
    },
    {
      slug: "roblox",
      name: "Roblox",
      emoji: "🤖",
      description: "Robux Gift Cards",
      gradient: "from-red-500 to-pink-600",
      order: 3,
    },
    {
      slug: "pubg",
      name: "PUBG Mobile",
      emoji: "🔫",
      description: "UC Top-ups",
      gradient: "from-orange-500 to-yellow-600",
      order: 4,
    },
    {
      slug: "steam",
      name: "Steam",
      emoji: "💨",
      description: "Steam Wallet Codes",
      gradient: "from-slate-600 to-slate-800",
      order: 5,
    },
    {
      slug: "itunes",
      name: "iTunes",
      emoji: "🎵",
      description: "Apple Gift Cards",
      gradient: "from-purple-500 to-pink-600",
      order: 6,
    },
    {
      slug: "razer",
      name: "Razer Gold",
      emoji: "💎",
      description: "Game Credits",
      gradient: "from-green-400 to-cyan-500",
      order: 7,
    },
    {
      slug: "discord",
      name: "Discord Nitro",
      emoji: "💬",
      description: "Premium Subscriptions",
      gradient: "from-indigo-500 to-purple-600",
      order: 8,
    },
    {
      slug: "minecraft",
      name: "Minecraft",
      emoji: "⛏️",
      description: "Game Editions",
      gradient: "from-green-600 to-lime-600",
      order: 9,
    },
    {
      slug: "nintendo",
      name: "Nintendo",
      emoji: "🎲",
      description: "eShop Cards",
      gradient: "from-red-600 to-red-700",
      order: 10,
    },
    {
      slug: "netflix",
      name: "Netflix",
      emoji: "🎬",
      description: "Premium Plans",
      gradient: "from-red-600 to-black",
      order: 11,
    },
    {
      slug: "amazon",
      name: "Amazon",
      emoji: "📦",
      description: "Gift Cards",
      gradient: "from-yellow-500 to-orange-600",
      order: 12,
    },
    {
      slug: "google-play",
      name: "Google Play",
      emoji: "🎮",
      description: "Play Store Credits",
      gradient: "from-blue-500 to-green-500",
      order: 13,
    },
  ];

  const createdCategories = {};
  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: categoryData,
      create: categoryData,
    });
    createdCategories[categoryData.slug] = category;
    console.log(`✅ Category created: ${category.emoji} ${category.name}`);
  }

  // 3. Update existing products with categoryId and regionId
  console.log("\n🔗 Linking products to categories and regions...");

  const products = await prisma.product.findMany();
  let updatedCount = 0;

  for (const product of products) {
    const updates = {};

    // Determine category based on product name
    if (
      product.name.toLowerCase().includes("playstation") ||
      product.name.toLowerCase().includes("psn")
    ) {
      updates.categoryId = createdCategories["playstation"].id;
      updates.category = "playstation";
    } else if (product.name.toLowerCase().includes("xbox")) {
      updates.categoryId = createdCategories["xbox"].id;
      updates.category = "xbox";
    } else if (
      product.name.toLowerCase().includes("roblox") ||
      product.name.toLowerCase().includes("robux")
    ) {
      updates.categoryId = createdCategories["roblox"].id;
      updates.category = "roblox";
    } else if (
      product.name.toLowerCase().includes("pubg") ||
      product.name.toLowerCase().includes("uc")
    ) {
      updates.categoryId = createdCategories["pubg"].id;
      updates.category = "pubg";
    } else if (product.name.toLowerCase().includes("steam")) {
      updates.categoryId = createdCategories["steam"].id;
      updates.category = "steam";
    } else if (
      product.name.toLowerCase().includes("itunes") ||
      product.name.toLowerCase().includes("apple")
    ) {
      updates.categoryId = createdCategories["itunes"].id;
      updates.category = "itunes";
    } else if (product.name.toLowerCase().includes("razer")) {
      updates.categoryId = createdCategories["razer"].id;
      updates.category = "razer";
    } else if (product.name.toLowerCase().includes("discord")) {
      updates.categoryId = createdCategories["discord"].id;
      updates.category = "discord";
    } else if (product.name.toLowerCase().includes("minecraft")) {
      updates.categoryId = createdCategories["minecraft"].id;
      updates.category = "minecraft";
    } else if (
      product.name.toLowerCase().includes("nintendo") ||
      product.name.toLowerCase().includes("switch")
    ) {
      updates.categoryId = createdCategories["nintendo"].id;
      updates.category = "nintendo";
    } else if (product.name.toLowerCase().includes("netflix")) {
      updates.categoryId = createdCategories["netflix"].id;
      updates.category = "netflix";
    } else if (product.name.toLowerCase().includes("amazon")) {
      updates.categoryId = createdCategories["amazon"].id;
      updates.category = "amazon";
    } else if (product.name.toLowerCase().includes("google")) {
      updates.categoryId = createdCategories["google-play"].id;
      updates.category = "google-play";
    }

    // Determine region based on product name
    if (product.name.includes("USA") || product.name.includes("US")) {
      updates.regionId = createdRegions["USA"].id;
    } else if (product.name.includes("UK")) {
      updates.regionId = createdRegions["UK"].id;
    } else if (product.name.includes("UAE")) {
      updates.regionId = createdRegions["UAE"].id;
    } else if (product.name.includes("KSA")) {
      updates.regionId = createdRegions["KSA"].id;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.product.update({
        where: { id: product.id },
        data: updates,
      });
      updatedCount++;
      console.log(
        `✅ Updated: ${product.name} → ${updates.category || "no category"} | ${
          updates.regionId ? "region assigned" : "no region"
        }`
      );
    }
  }

  console.log(`\n✨ Seed complete! Updated ${updatedCount} products.`);
  console.log(`📂 Categories: ${Object.keys(createdCategories).length}`);
  console.log(`📍 Regions: ${Object.keys(createdRegions).length}`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
