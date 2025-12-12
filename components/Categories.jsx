"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Title from "./Title";

const Categories = () => {
  const router = useRouter();

  // Color mapping: User-friendly names to Tailwind gradient classes
  const colorGradients = {
    "Ocean Blue": "from-blue-500 to-indigo-600",
    "Forest Green": "from-green-500 to-emerald-600",
    "Cherry Red": "from-red-500 to-pink-600",
    "Sunset Orange": "from-orange-500 to-yellow-600",
    "Charcoal Gray": "from-slate-600 to-slate-800",
    "Royal Purple": "from-purple-500 to-pink-600",
    "Neon Mint": "from-green-400 to-cyan-500",
    "Deep Purple": "from-indigo-500 to-purple-600",
    "Fresh Lime": "from-green-600 to-lime-600",
    "Classic Red": "from-red-600 to-red-700",
    "Midnight Red": "from-red-600 to-black",
    "Golden Yellow": "from-yellow-500 to-orange-600",
    "Sky Blue": "from-blue-500 to-green-500",
  };

  const categories = [
    {
      id: "playstation",
      name: "PlayStation",
      emoji: "🎮",
      description: "PSN Gift Cards",
      color: "Ocean Blue",
    },
    {
      id: "xbox",
      name: "XBox",
      emoji: "🎯",
      description: "XBox Gift Cards",
      color: "Forest Green",
    },
    {
      id: "roblox",
      name: "Roblox",
      emoji: "🤖",
      description: "Robux Gift Cards",
      color: "Cherry Red",
    },
    {
      id: "pubg",
      name: "PUBG Mobile",
      emoji: "🔫",
      description: "UC Top-ups",
      color: "Sunset Orange",
    },
    {
      id: "steam",
      name: "Steam",
      emoji: "💨",
      description: "Steam Wallet Codes",
      color: "Charcoal Gray",
    },
    {
      id: "itunes",
      name: "iTunes",
      emoji: "🎵",
      description: "Apple Gift Cards",
      color: "Royal Purple",
    },
    {
      id: "razer",
      name: "Razer Gold",
      emoji: "💎",
      description: "Game Credits",
      color: "Neon Mint",
    },
    {
      id: "discord",
      name: "Discord Nitro",
      emoji: "💬",
      description: "Premium Subscriptions",
      color: "Deep Purple",
    },
    {
      id: "minecraft",
      name: "Minecraft",
      emoji: "⛏️",
      description: "Game Editions",
      color: "Fresh Lime",
    },
    {
      id: "nintendo",
      name: "Nintendo",
      emoji: "🎲",
      description: "eShop Cards",
      color: "Classic Red",
    },
    {
      id: "netflix",
      name: "Netflix",
      emoji: "🎬",
      description: "Premium Plans",
      color: "Midnight Red",
    },
    {
      id: "amazon",
      name: "Amazon",
      emoji: "📦",
      description: "Gift Cards",
      color: "Golden Yellow",
    },
    {
      id: "google-play",
      name: "Google Play",
      emoji: "🎮",
      description: "Play Store Credits",
      color: "Sky Blue",
    },
  ];

  const handleCategoryClick = (categoryId) => {
    // Navigate to a category page with all products filtered by category
    router.push(`/category/${categoryId}`);
  };

  return (
    <div
      id="categories"
      className="px-4 sm:px-6 my-16 sm:my-20 max-w-7xl mx-auto"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#16112c] mb-4">
          Browse Gift Cards
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose from our collection of digital gift cards across multiple
          categories
        </p>
      </div>

      {/* Category Grid - 2 cols mobile, 3-4 cols tablet, 4-5 cols desktop */}
      <div className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#1c75bc] hover:-translate-y-1"
          >
            {/* Gradient Background */}
            <div
              className={`absolute inset-0 bg-linear-to-br ${
                colorGradients[category.color]
              } opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
            />

            {/* Content */}
            <div className="relative p-4 sm:p-6 flex flex-col items-center text-center">
              {/* Emoji Icon */}
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {category.emoji}
              </div>

              {/* Category Name */}
              <h3 className="font-semibold text-[#16112c] text-sm sm:text-base mb-1 sm:mb-2 group-hover:text-[#1c75bc] transition-colors">
                {category.name}
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-500 group-hover:text-slate-600 transition-colors">
                {category.description}
              </p>

              {/* Arrow indicator on hover */}
              <div className="mt-3 sm:mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-xs sm:text-sm text-[#1c75bc] font-medium">
                  View Cards →
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Categories;
