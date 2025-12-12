"use client";

import {
  StarIcon,
  TagIcon,
  ShieldCheckIcon,
  ZapIcon,
  PackageIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

const ProductDetails = ({ product }) => {
  const productId = product.id;
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "Rs";

  const router = useRouter();

  const [mainImage, setMainImage] = useState(product.images[0]);

  const handleBuyNow = () => {
    // Redirect directly to checkout with this product
    router.push(`/checkout?productId=${productId}`);
  };

  const averageRating =
    product.rating?.length > 0
      ? product.rating.reduce((acc, item) => acc + item.rating, 0) /
        product.rating.length
      : 0;

  return (
    <div className="flex max-lg:flex-col gap-12">
      <div className="flex max-sm:flex-col-reverse gap-3">
        <div className="flex sm:flex-col gap-3">
          {product.images.map((image, index) => (
            <div
              key={index}
              onClick={() => setMainImage(product.images[index])}
              className="bg-slate-100 flex items-center justify-center size-26 rounded-lg group cursor-pointer"
            >
              <Image
                src={image}
                className="group-hover:scale-103 group-active:scale-95 transition"
                alt=""
                width={45}
                height={45}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center h-100 sm:size-113 bg-slate-100 rounded-lg ">
          <Image src={mainImage} alt="" width={250} height={250} />
        </div>
      </div>
      <div className="flex-1">
        <h1 className="text-3xl font-semibold text-slate-800">
          {product.name}
        </h1>
        <div className="flex items-center mt-2">
          {Array(5)
            .fill("")
            .map((_, index) => (
              <StarIcon
                key={index}
                size={14}
                className="text-transparent mt-0.5"
                fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"}
              />
            ))}
          <p className="text-sm ml-3 text-slate-500">
            {product.rating.length} Reviews
          </p>
        </div>
        <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800">
          <p>
            {" "}
            {currency}
            {product.price}{" "}
          </p>
          <p className="text-xl text-slate-500 line-through">
            {currency}
            {product.mrp}
          </p>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <TagIcon size={14} />
          <p>
            Save{" "}
            {(((product.mrp - product.price) / product.mrp) * 100).toFixed(0)}%
            right now
          </p>
        </div>
        <div className="flex items-end gap-5 mt-10">
          <button
            onClick={handleBuyNow}
            className="bg-green-600 text-white px-12 py-4 text-base font-semibold rounded-lg hover:bg-green-700 active:scale-95 transition shadow-lg"
          >
            Buy Now - {currency}
            {product.price}
          </button>
        </div>
        <hr className="border-gray-300 my-5" />
        <div className="flex flex-col gap-4 text-slate-600">
          <p className="flex gap-3 items-center">
            <ZapIcon className="text-green-500" size={20} />
            <span className="font-medium">Instant Delivery</span> - Get your
            code within 10 minutes
          </p>
          <p className="flex gap-3 items-center">
            <ShieldCheckIcon className="text-blue-500" size={20} />
            <span className="font-medium">100% Secure Payment</span> - Your
            transaction is protected
          </p>
          <p className="flex gap-3 items-center">
            <PackageIcon className="text-purple-500" size={20} />
            <span className="font-medium">Original Gift Cards</span> - Verified
            sellers only
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
