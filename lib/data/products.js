/**
 * HARDCODED GIFT CARD PRODUCTS
 *
 * These 6 products are the core offerings of PakCards.
 * They are static and managed by the admin only.
 *
 * Product IDs are fixed for consistency across database resets.
 */

export const PRODUCTS = [
  {
    id: "prod_steam_wallet_1000",
    name: "Steam Wallet ₨1000",
    description:
      "₨1000 Steam Wallet Code - Instant delivery within 10 minutes. Use to purchase games, software, and other content on Steam platform. Valid worldwide.",
    mrp: 1200,
    price: 1000,
    category: "gaming",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg",
    ],
    deliveryType: "instant",
    requiresApproval: false,
    stockType: "limited",
    inStock: true,
    // Digital codes will be managed in database
    // Initial codes: 3 available
  },
  {
    id: "prod_playstation_5000",
    name: "PlayStation Store ₨5000",
    description:
      "₨5000 PlayStation Store Gift Card - Manual verification required. Can be used to purchase games, add-ons, subscriptions on PlayStation Store. Delivery within 2-4 hours after payment verification.",
    mrp: 5500,
    price: 5000,
    category: "gaming",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg",
    ],
    deliveryType: "manual",
    requiresApproval: true,
    stockType: "limited",
    inStock: true,
    // Initial codes: 2 available
  },
  {
    id: "prod_netflix_premium_500",
    name: "Netflix Premium ₨500/Month",
    description:
      "Netflix Premium 1 Month Subscription Code - Instant delivery. Enjoy unlimited movies and TV shows on 4 screens in Ultra HD. Perfect for families!",
    mrp: 600,
    price: 500,
    category: "entertainment",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    ],
    deliveryType: "instant",
    requiresApproval: false,
    stockType: "limited",
    inStock: true,
    // Initial codes: 4 available
  },
  {
    id: "prod_amazon_10000",
    name: "Amazon Gift Card ₨10000",
    description:
      "₨10,000 Amazon Gift Card - Manual verification required. Can be used to purchase any products on Amazon.com. Great for shopping electronics, books, and more. Delivery after payment verification.",
    mrp: 10500,
    price: 10000,
    category: "shopping",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    ],
    deliveryType: "manual",
    requiresApproval: true,
    stockType: "limited",
    inStock: true,
    // Initial codes: 1 available
  },
  {
    id: "prod_spotify_premium_300",
    name: "Spotify Premium ₨300/Month",
    description:
      "Spotify Premium 1 Month Code - Instant delivery. Ad-free music, offline listening, and unlimited skips. Enjoy 100M+ songs and podcasts.",
    mrp: 350,
    price: 300,
    category: "entertainment",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
    ],
    deliveryType: "instant",
    requiresApproval: false,
    stockType: "limited",
    inStock: true,
    // Initial codes: 2 available
  },
  {
    id: "prod_google_play_2000",
    name: "Google Play ₨2000",
    description:
      "₨2000 Google Play Gift Card - Instant delivery. Use for apps, games, music, movies, and more on Google Play Store. Works on Android devices.",
    mrp: 2200,
    price: 2000,
    category: "shopping",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg",
    ],
    deliveryType: "instant",
    requiresApproval: false,
    stockType: "limited",
    inStock: true,
    // Initial codes: 3 available
  },
];

/**
 * Initial digital codes for each product
 * These will be inserted into the database during seed
 */
export const PRODUCT_CODES = {
  prod_steam_wallet_1000: [
    "STEAM-1000-XXXX-YYYY-ZZZZ",
    "STEAM-1000-AAAA-BBBB-CCCC",
    "STEAM-1000-DDDD-EEEE-FFFF",
  ],
  prod_playstation_5000: ["PS-5000-XXXX-YYYY-ZZZZ", "PS-5000-AAAA-BBBB-CCCC"],
  prod_netflix_premium_500: [
    "NETFLIX-500-XXXX-YYYY",
    "NETFLIX-500-AAAA-BBBB",
    "NETFLIX-500-CCCC-DDDD",
    "NETFLIX-500-EEEE-FFFF",
  ],
  prod_amazon_10000: ["AMAZON-10K-XXXX-YYYY-ZZZZ"],
  prod_spotify_premium_300: ["SPOTIFY-300-XXXX-YYYY", "SPOTIFY-300-AAAA-BBBB"],
  prod_google_play_2000: [
    "GPLAY-2000-XXXX-YYYY-ZZZZ",
    "GPLAY-2000-AAAA-BBBB-CCCC",
    "GPLAY-2000-DDDD-EEEE-FFFF",
  ],
};

/**
 * Product categories
 */
export const CATEGORIES = ["gaming", "entertainment", "shopping"];

/**
 * Get product by ID
 */
export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

/**
 * Get products by category
 */
export function getProductsByCategory(category) {
  return PRODUCTS.filter(
    (p) => p.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get instant delivery products
 */
export function getInstantProducts() {
  return PRODUCTS.filter((p) => p.deliveryType === "instant");
}

/**
 * Get manual verification products
 */
export function getManualProducts() {
  return PRODUCTS.filter((p) => p.deliveryType === "manual");
}

/**
 * Get in-stock products
 */
export function getInStockProducts() {
  return PRODUCTS.filter((p) => p.inStock === true);
}

/**
 * Total products count
 */
export const TOTAL_PRODUCTS = PRODUCTS.length;

/**
 * Total initial codes available
 */
export const TOTAL_CODES = Object.values(PRODUCT_CODES).reduce(
  (sum, codes) => sum + codes.length,
  0
);
