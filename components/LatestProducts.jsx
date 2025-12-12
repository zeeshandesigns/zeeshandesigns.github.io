"use client";
import React from "react";
import Title from "./Title";
import ProductCard from "./ProductCard";
import { useSelector } from "react-redux";

const LatestProducts = () => {
  const products = useSelector((state) => state.product.list);

  return (
    <div className="px-4 sm:px-6 my-16 sm:my-20 max-w-7xl mx-auto">
      <Title
        title="All Gift Cards"
        description={`${products.length} gift cards available for instant purchase`}
        visibleButton={false}
      />

      {/* Mobile-first responsive grid: 2 cols mobile, 3-5 cols desktop */}
      <div className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Show message if no products */}
      {products.length === 0 && (
        <div className="text-center py-12 sm:py-20 text-slate-500">
          <p className="text-lg sm:text-xl">
            No gift cards available at the moment
          </p>
          <p className="text-xs sm:text-sm mt-2">
            Check back soon for new cards!
          </p>
        </div>
      )}
    </div>
  );
};

export default LatestProducts;
