"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, TrendingUp } from "lucide-react";

const FeaturedProducts = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "Rs";

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      // Get first 6 products
      setProducts(data.products?.slice(0, 6) || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-2xl h-80 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-[#1c75bc]/10 border border-[#1c75bc]/20 rounded-full px-4 py-2 mb-4">
          <TrendingUp className="w-4 h-4 text-[#1c75bc]" />
          <span className="text-sm font-medium text-[#16112c]">
            Most Popular
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-[#16112c] mb-4">
          Featured Gift Cards
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover our most popular digital gift cards across gaming,
          entertainment, and shopping platforms
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => router.push(`/product/${product.id}`)}
            className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 cursor-pointer hover:-translate-y-2"
          >
            {/* Product Image */}
            <div className="relative h-48 bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden">
              {product.images && product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl">{product.logo || "🎁"}</span>
                </div>
              )}

              {/* Badge */}
              {product.inStock && (
                <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  In Stock
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-6">
              <h3 className="font-semibold text-lg text-[#16112c] mb-2 line-clamp-2 group-hover:text-[#1c75bc] transition-colors">
                {product.name}
              </h3>

              {/* Rating */}
              {product.averageRating > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-700">
                      {product.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    ({product.totalRatings} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div>
                  {product.mrp > product.price && (
                    <span className="text-sm text-gray-400 line-through mr-2">
                      {currency}
                      {product.mrp}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-[#1c75bc]">
                    {currency}
                    {product.price}
                  </span>
                </div>
                <button className="bg-[#1c75bc] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1557a0] transition-colors group-hover:scale-110">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <button
          onClick={() =>
            window.scrollTo({
              top: document.getElementById("categories")?.offsetTop - 80 || 600,
              behavior: "smooth",
            })
          }
          className="bg-[#16112c] hover:bg-[#1c75bc] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
        >
          Browse All Categories
        </button>
      </div>
    </div>
  );
};

export default FeaturedProducts;
