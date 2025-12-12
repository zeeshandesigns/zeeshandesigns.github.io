"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, CreditCard, Mail, CheckCircle } from "lucide-react";

const HowItWorks = () => {
  const router = useRouter();
  const steps = [
    {
      icon: ShoppingCart,
      title: "Choose Your Card",
      description:
        "Browse our extensive collection and select the gift card you want",
      color: "bg-[#1c75bc]",
    },
    {
      icon: CreditCard,
      title: "Complete Payment",
      description: "Pay securely using your preferred payment method",
      color: "bg-[#1c75bc]",
    },
    {
      icon: Mail,
      title: "Receive Code",
      description:
        "Get your digital code instantly via email after verification",
      color: "bg-[#1c75bc]",
    },
    {
      icon: CheckCircle,
      title: "Start Using",
      description: "Redeem your code and enjoy your purchase immediately",
      color: "bg-[#1c75bc]",
    },
  ];

  return (
    <div id="how-it-works" className="bg-gray-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#16112c] mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get your gift card in 4 simple steps. Fast, secure, and hassle-free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line (hidden on mobile, visible on lg) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gray-300 -ml-4 z-0">
                  <div className="h-full bg-linear-to-r from-[#1c75bc] to-transparent w-1/2"></div>
                </div>
              )}

              {/* Step Card */}
              <div className="relative bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 z-10">
                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-[#16112c] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div
                  className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                >
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-[#16112c] mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">Ready to get started?</p>
          <button
            onClick={() =>
              window.scrollTo({
                top:
                  document.getElementById("categories")?.offsetTop - 80 || 600,
                behavior: "smooth",
              })
            }
            className="bg-[#1c75bc] hover:bg-[#1557a0] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            Start Shopping Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
