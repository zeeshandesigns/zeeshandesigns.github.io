"use client";
import { StarIcon, Zap, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const ProductCard = ({ product }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "Rs";

  // calculate the average rating of the product
  const rating =
    product.rating && product.rating.length > 0
      ? Math.round(
          product.rating.reduce((acc, curr) => acc + curr.rating, 0) /
            product.rating.length
        )
      : 0;

  return (
    <Link href={`/product/${product.id}`} className=" group max-xl:mx-auto">
      <div className="bg-[#F5F5F5] h-40 sm:w-60 sm:h-68 rounded-lg flex items-center justify-center relative">
        {product.logo ? (
          <Image
            width={500}
            height={500}
            className="max-h-30 sm:max-h-40 w-auto group-hover:scale-115 transition duration-300"
            src={product.logo}
            alt={product.name}
          />
        ) : (
          <Image
            width={500}
            height={500}
            className="max-h-30 sm:max-h-40 w-auto group-hover:scale-115 transition duration-300"
            src={product.images[0]}
            alt={product.name}
          />
        )}

        {/* Delivery Type Badge */}
        {product.deliveryType && (
          <div className="absolute top-2 right-2">
            {product.deliveryType === "instant" ? (
              <div className="bg-green-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs shadow-md">
                <Zap size={12} fill="white" />
                <span>Instant</span>
              </div>
            ) : (
              <div className="bg-orange-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs shadow-md">
                <Package size={12} />
                <span>Manual</span>
              </div>
            )}
          </div>
        )}

        {/* Region Flag Badge */}
        {product.regionRelation && product.regionRelation.flag && (
          <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded-full shadow-md text-lg">
            {product.regionRelation.flag}
          </div>
        )}
      </div>
      <div className="flex justify-between gap-3 text-sm text-[#16112c] pt-2 max-w-60">
        <div>
          <p className="font-medium">{product.name}</p>
          <div className="flex">
            {Array(5)
              .fill("")
              .map((_, index) => (
                <StarIcon
                  key={index}
                  size={14}
                  className="text-transparent mt-0.5"
                  fill={rating >= index + 1 ? "#1c75bc" : "#D1D5DB"}
                />
              ))}
          </div>
        </div>
        <p className="font-bold text-[#1c75bc]">
          {currency}
          {product.price}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
