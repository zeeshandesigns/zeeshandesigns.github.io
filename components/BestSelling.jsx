"use client";
import Title from "./Title";
import ProductCard from "./ProductCard";
import { useSelector } from "react-redux";

const BestSelling = () => {
  const displayQuantity = 4;
  const products = useSelector((state) => state.product.list);

  // Get top 4 best selling products (by rating count)
  const bestSellingProducts = [...products]
    .sort((a, b) => b.rating.length - a.rating.length)
    .slice(0, displayQuantity);

  return (
    bestSellingProducts.length > 0 && (
      <div className="px-4 sm:px-6 my-16 sm:my-20 max-w-7xl mx-auto">
        <Title
          title="Popular Gift Cards"
          description="Most loved by our customers"
          visibleButton={false}
        />

        {/* 4 columns on desktop, 2 on mobile */}
        <div className="mt-8 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    )
  );
};

export default BestSelling;
