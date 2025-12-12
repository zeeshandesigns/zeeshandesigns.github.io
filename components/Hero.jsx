"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Zap, Shield, Gift } from "lucide-react";

const Hero = () => {
  const router = useRouter();
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "Rs";

  return (
    <div className="relative bg-[#16112c] text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#1c75bc] rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1c75bc] rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#1c75bc]/20 border border-[#1c75bc]/30 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-[#1c75bc]" />
              <span className="text-sm font-medium">
                Instant Digital Delivery
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Your Ultimate
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-[#1c75bc] to-blue-400">
                Gift Card Store
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
              Purchase digital gift cards for gaming, entertainment, and
              shopping with instant delivery. Safe, secure, and available 24/7.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() =>
                  window.scrollTo({
                    top:
                      document.getElementById("categories")?.offsetTop - 80 ||
                      600,
                    behavior: "smooth",
                  })
                }
                className="bg-[#1c75bc] hover:bg-[#1557a0] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                Browse Gift Cards
              </button>
              <button
                onClick={() =>
                  window.scrollTo({
                    top:
                      document.getElementById("how-it-works")?.offsetTop || 800,
                    behavior: "smooth",
                  })
                }
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
              >
                How It Works
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/10">
              <div>
                <div className="text-3xl font-bold text-[#1c75bc]">80+</div>
                <div className="text-sm text-gray-400 mt-1">Products</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#1c75bc]">13</div>
                <div className="text-sm text-gray-400 mt-1">Categories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#1c75bc]">24/7</div>
                <div className="text-sm text-gray-400 mt-1">Support</div>
              </div>
            </div>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-[#1c75bc]/20 rounded-xl flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-[#1c75bc]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Easy Purchase</h3>
              <p className="text-sm text-gray-400">
                Simple checkout process with multiple payment options
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 mt-8">
              <div className="w-12 h-12 bg-[#1c75bc]/20 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-[#1c75bc]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Instant Delivery</h3>
              <p className="text-sm text-gray-400">
                Receive your codes immediately after payment verification
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-[#1c75bc]/20 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-[#1c75bc]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">100% Secure</h3>
              <p className="text-sm text-gray-400">
                All transactions protected with advanced encryption
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 mt-8">
              <div className="w-12 h-12 bg-[#1c75bc]/20 rounded-xl flex items-center justify-center mb-4">
                <Gift className="w-6 h-6 text-[#1c75bc]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Great Selection</h3>
              <p className="text-sm text-gray-400">
                Wide variety of gift cards for gaming and entertainment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
