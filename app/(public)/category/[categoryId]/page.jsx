"use client";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import Title from "@/components/Title";

const CategoryPage = () => {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId;
  const products = useSelector((state) => state.product.list);
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [regions, setRegions] = useState([
    { id: "all", name: "All Regions", flag: "🌍", code: "all" },
  ]);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const response = await fetch("/api/admin/regions");
      const data = await response.json();
      if (data.regions) {
        const allRegions = [
          { id: "all", name: "All Regions", flag: "🌍", code: "all" },
          ...data.regions.filter((r) => r.isActive),
        ];
        setRegions(allRegions);
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
    }
  };

  // Map category IDs to actual product name patterns
  const categoryMap = {
    playstation: ["playstation", "psn", "ps-"],
    xbox: ["xbox"],
    roblox: ["roblox"],
    pubg: ["pubg"],
    steam: ["steam"],
    itunes: ["itunes"],
    razer: ["razer"],
    discord: ["discord"],
    minecraft: ["minecraft"],
    nintendo: ["nintendo"],
    netflix: ["netflix"],
    amazon: ["amazon"],
    "google-play": ["google play", "gplay"],
  };

  // Get category display name
  const categoryNames = {
    playstation: "PlayStation Network",
    xbox: "Xbox",
    roblox: "Roblox",
    pubg: "PUBG Mobile",
    steam: "Steam",
    itunes: "iTunes",
    razer: "Razer Gold",
    discord: "Discord Nitro",
    minecraft: "Minecraft",
    nintendo: "Nintendo",
    netflix: "Netflix",
    amazon: "Amazon",
    "google-play": "Google Play",
  };

  // Filter products by category
  const categoryPatterns = categoryMap[categoryId] || [];
  let filteredProducts = products.filter((product) => {
    const productNameLower = product.name.toLowerCase();
    return categoryPatterns.some((pattern) =>
      productNameLower.includes(pattern.toLowerCase())
    );
  });

  // Filter by region if selected
  if (selectedRegion !== "all") {
    filteredProducts = filteredProducts.filter((product) => {
      // Match by regionId directly (products have regionId field now)
      return product.regionId === selectedRegion;
    });
  }

  const categoryName = categoryNames[categoryId] || "Gift Cards";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 py-8 sm:py-12 max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push("/")}
          className="mb-6 sm:mb-8 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm sm:text-base">Back to Categories</span>
        </button>

        {/* Category Title */}
        <Title
          title={`${categoryName} Gift Cards`}
          description={`${filteredProducts.length} denominations available`}
          visibleButton={false}
        />

        {/* Region Filters */}
        <div className="mt-6 sm:mt-8 flex flex-wrap gap-2 sm:gap-3 justify-center">
          {regions.map((region) => (
            <button
              key={region.id}
              onClick={() => setSelectedRegion(region.id)}
              className={`
                px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-medium text-sm sm:text-base
                transition-all duration-300 flex items-center gap-2
                ${
                  selectedRegion === region.id
                    ? "bg-gradient-to-r from-[#1c75bc] to-[#1557a0] text-white shadow-lg scale-105"
                    : "bg-white text-slate-700 border-2 border-slate-200 hover:border-[#1c75bc] hover:shadow-md"
                }
              `}
            >
              <span className="text-lg sm:text-xl">{region.flag}</span>
              <span>{region.name}</span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-20 text-slate-500">
            <p className="text-lg sm:text-xl">
              No products found in this category
            </p>
            <p className="text-xs sm:text-sm mt-2">
              Check back soon for new cards!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
