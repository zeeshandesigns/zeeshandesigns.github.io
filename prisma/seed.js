const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting comprehensive seed for PakCards Gift Card Marketplace...\n");
  console.log("📦 Single-Admin System with Regional Products & Multiple Denominations\n");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.deliveredCode.deleteMany({});
  await prisma.rating.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("✅ Cleared existing data\n");

  // Create test users
  console.log("👥 Creating users...");

  await prisma.user.create({
    data: {
      id: "user_357N8AecPsLiS0wVIMzdWcxBsAZ",
      name: "Zeeshan Haider",
      email: "zeeshan.haider4525@gmail.com",
      image: "https://i.pravatar.cc/150?img=70",
      isAdmin: true,
    },
  });

  await prisma.user.create({
    data: {
      id: "user_customer_001",
      name: "Hassan Raza",
      email: "hassan@example.com",
      image: "https://i.pravatar.cc/150?img=33",
      isAdmin: false,
    },
  });

  await prisma.user.create({
    data: {
      id: "user_customer_002",
      name: "Ayesha Malik",
      email: "ayesha@example.com",
      image: "https://i.pravatar.cc/150?img=10",
      isAdmin: false,
    },
  });

  console.log("✅ Created 3 users (1 admin, 2 customers)\n");

  // Create coupons
  console.log("🎟️  Creating coupons...");

  await prisma.coupon.create({
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

  await prisma.coupon.create({
    data: {
      code: "SAVE200",
      description: "₨200 flat discount",
      discount: 200,
      forNewUser: false,
      forMember: true,
      isPublic: true,
      expiresAt: new Date("2025-11-30"),
    },
  });

  console.log("✅ Created 2 active coupons\n");

  console.log("🎮 Creating comprehensive gift card product catalog...\n");

  const products = [];

  // ========== PLAYSTATION (USA, UK, UAE, KSA) - 19 products ==========
  console.log("📌 PlayStation Network Cards...");
  
  // USA (6 denominations)
  products.push({ id: "prod_ps_usa_10", name: "PlayStation Network USA $10", description: "PSN $10 USA - Add funds to your wallet", mrp: 1200, price: 1000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg"], deliveryType: "instant", digitalCodes: ["PS-USA-10-A", "PS-USA-10-B", "PS-USA-10-C"], availableCodes: 3, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_ps_usa_20", name: "PlayStation Network USA $20", description: "PSN $20 USA - Add funds to your wallet", mrp: 2400, price: 2000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg"], deliveryType: "instant", digitalCodes: ["PS-USA-20-A", "PS-USA-20-B"], availableCodes: 2, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_ps_usa_25", name: "PlayStation Network USA $25", description: "PSN $25 USA - Add funds to your wallet", mrp: 3000, price: 2500, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg"], deliveryType: "instant", digitalCodes: ["PS-USA-25-A", "PS-USA-25-B"], availableCodes: 2, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_ps_usa_50", name: "PlayStation Network USA $50", description: "PSN $50 USA - Add funds to your wallet", mrp: 6000, price: 5000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg"], deliveryType: "manual", digitalCodes: ["PS-USA-50-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_ps_usa_75", name: "PlayStation Network USA $75", description: "PSN $75 USA - Add funds to your wallet", mrp: 9000, price: 7500, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg"], deliveryType: "manual", digitalCodes: ["PS-USA-75-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_ps_usa_100", name: "PlayStation Network USA $100", description: "PSN $100 USA - Add funds to your wallet", mrp: 12000, price: 10000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg"], deliveryType: "manual", digitalCodes: ["PS-USA-100-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  
  // UK (5 denominations)
  products.push({ id: "prod_ps_uk_10", name: "PlayStation Network UK £10", description: "PSN £10 UK - Add funds to your wallet", mrp: 1500, price: 1200, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg"], deliveryType: "instant", digitalCodes: ["PS-UK-10-A", "PS-UK-10-B"], availableCodes: 2, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_ps_uk_20", name: "PlayStation Network UK £20", description: "PSN £20 UK - Add funds to your wallet", mrp: 3000, price: 2400, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg"], deliveryType: "instant", digitalCodes: ["PS-UK-20-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_ps_uk_25", name: "PlayStation Network UK £25", description: "PSN £25 UK - Add funds to your wallet", mrp: 3500, price: 3000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg"], deliveryType: "instant", digitalCodes: ["PS-UK-25-A", "PS-UK-25-B"], availableCodes: 2, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_ps_uk_50", name: "PlayStation Network UK £50", description: "PSN £50 UK - Add funds to your wallet", mrp: 7000, price: 6000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg"], deliveryType: "manual", digitalCodes: ["PS-UK-50-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_ps_uk_100", name: "PlayStation Network UK £100", description: "PSN £100 UK - Add funds to your wallet", mrp: 14000, price: 12000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg"], deliveryType: "manual", digitalCodes: ["PS-UK-100-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  
  // UAE (4 denominations)
  products.push({ id: "prod_ps_uae_50", name: "PlayStation Network UAE AED 50", description: "PSN AED 50 UAE - Add funds to your wallet", mrp: 1500, price: 1400, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg"], deliveryType: "instant", digitalCodes: ["PS-UAE-50-A", "PS-UAE-50-B"], availableCodes: 2, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_ps_uae_100", name: "PlayStation Network UAE AED 100", description: "PSN AED 100 UAE - Add funds to your wallet", mrp: 3200, price: 2800, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg"], deliveryType: "instant", digitalCodes: ["PS-UAE-100-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_ps_uae_250", name: "PlayStation Network UAE AED 250", description: "PSN AED 250 UAE - Add funds to your wallet", mrp: 7500, price: 7000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg"], deliveryType: "instant", digitalCodes: ["PS-UAE-250-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_ps_uae_500", name: "PlayStation Network UAE AED 500", description: "PSN AED 500 UAE - Add funds to your wallet", mrp: 15000, price: 14000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg"], deliveryType: "manual", digitalCodes: ["PS-UAE-500-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  
  // KSA (4 denominations)
  products.push({ id: "prod_ps_ksa_50", name: "PlayStation Network KSA SAR 50", description: "PSN SAR 50 KSA - Add funds to your wallet", mrp: 1500, price: 1300, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg"], deliveryType: "instant", digitalCodes: ["PS-KSA-50-A", "PS-KSA-50-B"], availableCodes: 2, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_ps_ksa_100", name: "PlayStation Network KSA SAR 100", description: "PSN SAR 100 KSA - Add funds to your wallet", mrp: 3000, price: 2600, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg"], deliveryType: "instant", digitalCodes: ["PS-KSA-100-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_ps_ksa_250", name: "PlayStation Network KSA SAR 250", description: "PSN SAR 250 KSA - Add funds to your wallet", mrp: 7500, price: 6500, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg"], deliveryType: "instant", digitalCodes: ["PS-KSA-250-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_ps_ksa_500", name: "PlayStation Network KSA SAR 500", description: "PSN SAR 500 KSA - Add funds to your wallet", mrp: 15000, price: 13000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg"], deliveryType: "manual", digitalCodes: ["PS-KSA-500-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });

  // ========== XBOX (USA, UK) - 10 products ==========
  console.log("📌 Xbox Gift Cards...");
  
  // USA (6 denominations)
  products.push({ id: "prod_xbox_usa_5", name: "Xbox Gift Card USA $5", description: "Xbox $5 USA - Games, apps, movies", mrp: 600, price: 500, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg"], deliveryType: "instant", digitalCodes: ["XBOX-USA-5-A", "XBOX-USA-5-B"], availableCodes: 2, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_xbox_usa_10", name: "Xbox Gift Card USA $10", description: "Xbox $10 USA - Games, apps, movies", mrp: 1200, price: 1000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg"], deliveryType: "instant", digitalCodes: ["XBOX-USA-10-A", "XBOX-USA-10-B"], availableCodes: 2, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_xbox_usa_15", name: "Xbox Gift Card USA $15", description: "Xbox $15 USA - Games, apps, movies", mrp: 1800, price: 1500, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg"], deliveryType: "instant", digitalCodes: ["XBOX-USA-15-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_xbox_usa_25", name: "Xbox Gift Card USA $25", description: "Xbox $25 USA - Games, apps, movies", mrp: 3000, price: 2500, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg"], deliveryType: "instant", digitalCodes: ["XBOX-USA-25-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_xbox_usa_50", name: "Xbox Gift Card USA $50", description: "Xbox $50 USA - Games, apps, movies", mrp: 6000, price: 5000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg"], deliveryType: "manual", digitalCodes: ["XBOX-USA-50-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_xbox_usa_100", name: "Xbox Gift Card USA $100", description: "Xbox $100 USA - Games, apps, movies", mrp: 12000, price: 10000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg"], deliveryType: "manual", digitalCodes: ["XBOX-USA-100-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  
  // UK (4 denominations)
  products.push({ id: "prod_xbox_uk_10", name: "Xbox Gift Card UK £10", description: "Xbox £10 UK - Games, apps, movies", mrp: 1500, price: 1200, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg"], deliveryType: "instant", digitalCodes: ["XBOX-UK-10-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_xbox_uk_25", name: "Xbox Gift Card UK £25", description: "Xbox £25 UK - Games, apps, movies", mrp: 3500, price: 3000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg"], deliveryType: "instant", digitalCodes: ["XBOX-UK-25-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_xbox_uk_50", name: "Xbox Gift Card UK £50", description: "Xbox £50 UK - Games, apps, movies", mrp: 7000, price: 6000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg"], deliveryType: "manual", digitalCodes: ["XBOX-UK-50-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_xbox_uk_100", name: "Xbox Gift Card UK £100", description: "Xbox £100 UK - Games, apps, movies", mrp: 14000, price: 12000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg"], deliveryType: "manual", digitalCodes: ["XBOX-UK-100-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });

  // ========== ROBLOX - 5 products ==========
  console.log("📌 Roblox Gift Cards...");
  products.push({ id: "prod_roblox_10", name: "Roblox Gift Card $10", description: "Roblox $10 - Get Robux", mrp: 1200, price: 1000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Roblox_Logo.svg/512px-Roblox_Logo.svg.png"], deliveryType: "instant", digitalCodes: ["ROBLOX-10-A", "ROBLOX-10-B", "ROBLOX-10-C"], availableCodes: 3, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_roblox_20", name: "Roblox Gift Card $20", description: "Roblox $20 - Get Robux", mrp: 2400, price: 2000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Roblox_Logo.svg/512px-Roblox_Logo.svg.png"], deliveryType: "instant", digitalCodes: ["ROBLOX-20-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_roblox_25", name: "Roblox Gift Card $25", description: "Roblox $25 - Get Robux", mrp: 3000, price: 2500, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Roblox_Logo.svg/512px-Roblox_Logo.svg.png"], deliveryType: "instant", digitalCodes: ["ROBLOX-25-A", "ROBLOX-25-B"], availableCodes: 2, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_roblox_50", name: "Roblox Gift Card $50", description: "Roblox $50 - Get Robux", mrp: 6000, price: 5000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Roblox_Logo.svg/512px-Roblox_Logo.svg.png"], deliveryType: "instant", digitalCodes: ["ROBLOX-50-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_roblox_100", name: "Roblox Gift Card $100", description: "Roblox $100 - Get Robux", mrp: 12000, price: 10000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Roblox_Logo.svg/512px-Roblox_Logo.svg.png"], deliveryType: "manual", digitalCodes: ["ROBLOX-100-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });

  // ========== PUBG MOBILE UC - 6 products ==========
  console.log("📌 PUBG Mobile UC...");
  products.push({ id: "prod_pubg_60", name: "PUBG Mobile 60 UC", description: "PUBG Mobile 60 Unknown Cash", mrp: 100, price: 80, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/PUBG_Mobile_logo.svg/512px-PUBG_Mobile_logo.svg.png"], deliveryType: "instant", digitalCodes: ["PUBG-60-A", "PUBG-60-B"], availableCodes: 2, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_pubg_325", name: "PUBG Mobile 325 UC", description: "PUBG Mobile 325 Unknown Cash", mrp: 500, price: 400, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/PUBG_Mobile_logo.svg/512px-PUBG_Mobile_logo.svg.png"], deliveryType: "instant", digitalCodes: ["PUBG-325-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_pubg_600", name: "PUBG Mobile 600 UC", description: "PUBG Mobile 600 Unknown Cash", mrp: 800, price: 700, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/PUBG_Mobile_logo.svg/512px-PUBG_Mobile_logo.svg.png"], deliveryType: "instant", digitalCodes: ["PUBG-600-A", "PUBG-600-B"], availableCodes: 2, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_pubg_1500", name: "PUBG Mobile 1500 UC", description: "PUBG Mobile 1500 Unknown Cash", mrp: 1800, price: 1500, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/PUBG_Mobile_logo.svg/512px-PUBG_Mobile_logo.svg.png"], deliveryType: "instant", digitalCodes: ["PUBG-1500-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_pubg_3000", name: "PUBG Mobile 3000 UC", description: "PUBG Mobile 3000 Unknown Cash", mrp: 3500, price: 3000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/PUBG_Mobile_logo.svg/512px-PUBG_Mobile_logo.svg.png"], deliveryType: "instant", digitalCodes: ["PUBG-3000-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_pubg_6000", name: "PUBG Mobile 6000 UC", description: "PUBG Mobile 6000 Unknown Cash", mrp: 7000, price: 6000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/PUBG_Mobile_logo.svg/512px-PUBG_Mobile_logo.svg.png"], deliveryType: "manual", digitalCodes: ["PUBG-6000-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });

  // ========== STEAM - 6 products ==========
  console.log("📌 Steam Wallet Codes...");
  products.push({ id: "prod_steam_5", name: "Steam Wallet Code $5", description: "Steam $5 - Purchase games & content", mrp: 600, price: 500, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg"], deliveryType: "instant", digitalCodes: ["STEAM-5-A", "STEAM-5-B"], availableCodes: 2, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_steam_10", name: "Steam Wallet Code $10", description: "Steam $10 - Purchase games & content", mrp: 1200, price: 1000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg"], deliveryType: "instant", digitalCodes: ["STEAM-10-A", "STEAM-10-B"], availableCodes: 2, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_steam_20", name: "Steam Wallet Code $20", description: "Steam $20 - Purchase games & content", mrp: 2400, price: 2000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg"], deliveryType: "instant", digitalCodes: ["STEAM-20-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_steam_50", name: "Steam Wallet Code $50", description: "Steam $50 - Purchase games & content", mrp: 6000, price: 5000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg"], deliveryType: "manual", digitalCodes: ["STEAM-50-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_steam_100", name: "Steam Wallet Code $100", description: "Steam $100 - Purchase games & content", mrp: 12000, price: 10000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg"], deliveryType: "manual", digitalCodes: ["STEAM-100-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_steam_250", name: "Steam Wallet Code $250", description: "Steam $250 - Purchase games & content", mrp: 30000, price: 25000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg"], deliveryType: "manual", digitalCodes: ["STEAM-250-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });

  // ========== iTUNES (USA) - 5 products ==========
  console.log("📌 iTunes Gift Cards...");
  products.push({ id: "prod_itunes_usa_10", name: "iTunes Gift Card USA $10", description: "iTunes $10 USA - App Store, iTunes Store", mrp: 1200, price: 1000, category: "entertainment", images: ["https://upload.wikimedia.org/wikipedia/commons/d/df/ITunes_logo.svg"], deliveryType: "instant", digitalCodes: ["ITUNES-USA-10-A", "ITUNES-USA-10-B"], availableCodes: 2, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_itunes_usa_15", name: "iTunes Gift Card USA $15", description: "iTunes $15 USA - App Store, iTunes Store", mrp: 1800, price: 1500, category: "entertainment", images: ["https://upload.wikimedia.org/wikipedia/commons/d/df/ITunes_logo.svg"], deliveryType: "instant", digitalCodes: ["ITUNES-USA-15-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_itunes_usa_25", name: "iTunes Gift Card USA $25", description: "iTunes $25 USA - App Store, iTunes Store", mrp: 3000, price: 2500, category: "entertainment", images: ["https://upload.wikimedia.org/wikipedia/commons/d/df/ITunes_logo.svg"], deliveryType: "instant", digitalCodes: ["ITUNES-USA-25-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_itunes_usa_50", name: "iTunes Gift Card USA $50", description: "iTunes $50 USA - App Store, iTunes Store", mrp: 6000, price: 5000, category: "entertainment", images: ["https://upload.wikimedia.org/wikipedia/commons/d/df/ITunes_logo.svg"], deliveryType: "manual", digitalCodes: ["ITUNES-USA-50-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_itunes_usa_100", name: "iTunes Gift Card USA $100", description: "iTunes $100 USA - App Store, iTunes Store", mrp: 12000, price: 10000, category: "entertainment", images: ["https://upload.wikimedia.org/wikipedia/commons/d/df/ITunes_logo.svg"], deliveryType: "manual", digitalCodes: ["ITUNES-USA-100-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });

  // ========== RAZER GOLD - 5 products ==========
  console.log("📌 Razer Gold...");
  products.push({ id: "prod_razer_5", name: "Razer Gold $5", description: "Razer Gold $5 - Ultimate game credits", mrp: 600, price: 500, category: "gaming", images: ["https://gold.razer.com/themes/custom/razer_gold/logo.svg"], deliveryType: "instant", digitalCodes: ["RAZER-5-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_razer_10", name: "Razer Gold $10", description: "Razer Gold $10 - Ultimate game credits", mrp: 1200, price: 1000, category: "gaming", images: ["https://gold.razer.com/themes/custom/razer_gold/logo.svg"], deliveryType: "instant", digitalCodes: ["RAZER-10-A", "RAZER-10-B"], availableCodes: 2, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_razer_25", name: "Razer Gold $25", description: "Razer Gold $25 - Ultimate game credits", mrp: 3000, price: 2500, category: "gaming", images: ["https://gold.razer.com/themes/custom/razer_gold/logo.svg"], deliveryType: "instant", digitalCodes: ["RAZER-25-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_razer_50", name: "Razer Gold $50", description: "Razer Gold $50 - Ultimate game credits", mrp: 6000, price: 5000, category: "gaming", images: ["https://gold.razer.com/themes/custom/razer_gold/logo.svg"], deliveryType: "manual", digitalCodes: ["RAZER-50-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_razer_100", name: "Razer Gold $100", description: "Razer Gold $100 - Ultimate game credits", mrp: 12000, price: 10000, category: "gaming", images: ["https://gold.razer.com/themes/custom/razer_gold/logo.svg"], deliveryType: "manual", digitalCodes: ["RAZER-100-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });

  // ========== DISCORD NITRO - 2 products ==========
  console.log("📌 Discord Nitro...");
  products.push({ id: "prod_discord_nitro_1m", name: "Discord Nitro 1 Month", description: "Discord Nitro 1 Month - HD video, custom emojis", mrp: 700, price: 600, category: "entertainment", images: ["https://upload.wikimedia.org/wikipedia/commons/6/6b/Discord_full_logo.svg"], deliveryType: "instant", digitalCodes: ["DISCORD-1M-A", "DISCORD-1M-B"], availableCodes: 2, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_discord_nitro_1y", name: "Discord Nitro 1 Year", description: "Discord Nitro 1 Year - HD video, custom emojis", mrp: 7000, price: 6000, category: "entertainment", images: ["https://upload.wikimedia.org/wikipedia/commons/6/6b/Discord_full_logo.svg"], deliveryType: "manual", digitalCodes: ["DISCORD-1Y-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });

  // ========== MINECRAFT - 3 products ==========
  console.log("📌 Minecraft...");
  products.push({ id: "prod_minecraft_java", name: "Minecraft Java Edition", description: "Minecraft Java Edition - PC/Mac", mrp: 900, price: 800, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Minecraft_logo.svg/512px-Minecraft_logo.svg.png"], deliveryType: "instant", digitalCodes: ["MC-JAVA-A", "MC-JAVA-B"], availableCodes: 2, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_minecraft_bedrock", name: "Minecraft Bedrock Edition", description: "Minecraft Bedrock - Cross-platform", mrp: 800, price: 700, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Minecraft_logo.svg/512px-Minecraft_logo.svg.png"], deliveryType: "instant", digitalCodes: ["MC-BEDROCK-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_minecraft_realms", name: "Minecraft Realms Plus 3 Months", description: "Minecraft Realms Plus 3 Months", mrp: 2500, price: 2000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Minecraft_logo.svg/512px-Minecraft_logo.svg.png"], deliveryType: "instant", digitalCodes: ["MC-REALMS-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });

  // ========== NINTENDO - 5 products ==========
  console.log("📌 Nintendo eShop...");
  products.push({ id: "prod_nintendo_10", name: "Nintendo eShop Card $10", description: "Nintendo $10 - Switch games & DLC", mrp: 1200, price: 1000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg"], deliveryType: "instant", digitalCodes: ["NINTENDO-10-A", "NINTENDO-10-B"], availableCodes: 2, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_nintendo_20", name: "Nintendo eShop Card $20", description: "Nintendo $20 - Switch games & DLC", mrp: 2400, price: 2000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg"], deliveryType: "instant", digitalCodes: ["NINTENDO-20-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_nintendo_35", name: "Nintendo eShop Card $35", description: "Nintendo $35 - Switch games & DLC", mrp: 4200, price: 3500, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg"], deliveryType: "instant", digitalCodes: ["NINTENDO-35-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_nintendo_50", name: "Nintendo eShop Card $50", description: "Nintendo $50 - Switch games & DLC", mrp: 6000, price: 5000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg"], deliveryType: "manual", digitalCodes: ["NINTENDO-50-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_nintendo_100", name: "Nintendo eShop Card $100", description: "Nintendo $100 - Switch games & DLC", mrp: 12000, price: 10000, category: "gaming", images: ["https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg"], deliveryType: "manual", digitalCodes: ["NINTENDO-100-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });

  // ========== NETFLIX - 3 products ==========
  console.log("📌 Netflix...");
  products.push({ id: "prod_netflix_1m", name: "Netflix Premium 1 Month", description: "Netflix Premium 1 Month - 4 screens, Ultra HD", mrp: 600, price: 500, category: "entertainment", images: ["https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"], deliveryType: "instant", digitalCodes: ["NETFLIX-1M-A", "NETFLIX-1M-B", "NETFLIX-1M-C"], availableCodes: 3, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_netflix_3m", name: "Netflix Premium 3 Months", description: "Netflix Premium 3 Months - 4 screens, Ultra HD", mrp: 1700, price: 1500, category: "entertainment", images: ["https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"], deliveryType: "instant", digitalCodes: ["NETFLIX-3M-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_netflix_12m", name: "Netflix Premium 1 Year", description: "Netflix Premium 12 Months - 4 screens, Ultra HD", mrp: 6500, price: 6000, category: "entertainment", images: ["https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"], deliveryType: "manual", digitalCodes: ["NETFLIX-12M-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });

  // ========== AMAZON (USA) - 6 products ==========
  console.log("📌 Amazon Gift Cards...");
  products.push({ id: "prod_amazon_usa_5", name: "Amazon Gift Card USA $5", description: "Amazon $5 USA - Shop any products", mrp: 600, price: 500, category: "shopping", images: ["https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"], deliveryType: "instant", digitalCodes: ["AMAZON-USA-5-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_amazon_usa_10", name: "Amazon Gift Card USA $10", description: "Amazon $10 USA - Shop any products", mrp: 1200, price: 1000, category: "shopping", images: ["https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"], deliveryType: "instant", digitalCodes: ["AMAZON-USA-10-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_amazon_usa_25", name: "Amazon Gift Card USA $25", description: "Amazon $25 USA - Shop any products", mrp: 3000, price: 2500, category: "shopping", images: ["https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"], deliveryType: "instant", digitalCodes: ["AMAZON-USA-25-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_amazon_usa_50", name: "Amazon Gift Card USA $50", description: "Amazon $50 USA - Shop any products", mrp: 6000, price: 5000, category: "shopping", images: ["https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"], deliveryType: "manual", digitalCodes: ["AMAZON-USA-50-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_amazon_usa_100", name: "Amazon Gift Card USA $100", description: "Amazon $100 USA - Shop any products", mrp: 12000, price: 10000, category: "shopping", images: ["https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"], deliveryType: "manual", digitalCodes: ["AMAZON-USA-100-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_amazon_usa_200", name: "Amazon Gift Card USA $200", description: "Amazon $200 USA - Shop any products", mrp: 24000, price: 20000, category: "shopping", images: ["https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"], deliveryType: "manual", digitalCodes: ["AMAZON-USA-200-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });

  // ========== GOOGLE PLAY - 5 products ==========
  console.log("📌 Google Play Gift Cards...");
  products.push({ id: "prod_gplay_5", name: "Google Play Gift Card $5", description: "Google Play $5 - Apps, games, movies", mrp: 600, price: 500, category: "shopping", images: ["https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"], deliveryType: "instant", digitalCodes: ["GPLAY-5-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_gplay_10", name: "Google Play Gift Card $10", description: "Google Play $10 - Apps, games, movies", mrp: 1200, price: 1000, category: "shopping", images: ["https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"], deliveryType: "instant", digitalCodes: ["GPLAY-10-A", "GPLAY-10-B"], availableCodes: 2, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_gplay_25", name: "Google Play Gift Card $25", description: "Google Play $25 - Apps, games, movies", mrp: 3000, price: 2500, category: "shopping", images: ["https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"], deliveryType: "instant", digitalCodes: ["GPLAY-25-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_gplay_50", name: "Google Play Gift Card $50", description: "Google Play $50 - Apps, games, movies", mrp: 6000, price: 5000, category: "shopping", images: ["https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"], deliveryType: "manual", digitalCodes: ["GPLAY-50-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });
  products.push({ id: "prod_gplay_100", name: "Google Play Gift Card $100", description: "Google Play $100 - Apps, games, movies", mrp: 12000, price: 10000, category: "shopping", images: ["https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"], deliveryType: "manual", digitalCodes: ["GPLAY-100-A"], availableCodes: 1, inStock: true, totalRatings: 0, averageRating: 0 });

  // Create all products
  let totalCodes = 0;
  let instantCount = 0;
  let manualCount = 0;

  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData,
    });

    totalCodes += product.availableCodes;
    if (product.deliveryType === "instant") {
      instantCount++;
    } else {
      manualCount++;
    }
  }

  console.log(`\n✅ Created ${products.length} products\n`);

  console.log("\n✨ Seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - 3 users (1 admin, 2 customers)`);
  console.log(`   - 2 active coupons (WELCOME10, SAVE200)`);
  console.log(`   - ${products.length} gift card products`);
  console.log(`   - ${instantCount} instant delivery products`);
  console.log(`   - ${manualCount} manual delivery products`);
  console.log(`   - Total codes available: ${totalCodes}`);
  console.log("\n🎮 Product Categories:");
  console.log(`   - PlayStation: 19 products (USA/UK/UAE/KSA regions)`);
  console.log(`   - Xbox: 10 products (USA/UK regions)`);
  console.log(`   - Roblox: 5 products`);
  console.log(`   - PUBG Mobile: 6 products`);
  console.log(`   - Steam: 6 products`);
  console.log(`   - iTunes: 5 products`);
  console.log(`   - Razer Gold: 5 products`);
  console.log(`   - Discord Nitro: 2 products`);
  console.log(`   - Minecraft: 3 products`);
  console.log(`   - Nintendo: 5 products`);
  console.log(`   - Netflix: 3 products`);
  console.log(`   - Amazon: 6 products`);
  console.log(`   - Google Play: 5 products`);
  console.log("\n🚀 Database ready for PakCards!\n");
  console.log("💡 Admin: user_357N8AecPsLiS0wVIMzdWcxBsAZ (zeeshan.haider4525@gmail.com)\n");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
