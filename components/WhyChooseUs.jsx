"use client";
import React from "react";
import { Shield, Zap, Clock, Headphones, Award, Lock } from "lucide-react";

const WhyChooseUs = () => {
  const features = [
    {
      icon: Zap,
      title: "Instant Delivery",
      description:
        "Receive your digital codes immediately after payment verification. No waiting required.",
    },
    {
      icon: Shield,
      title: "100% Secure",
      description:
        "All transactions are encrypted and protected with industry-leading security measures.",
    },
    {
      icon: Clock,
      title: "24/7 Available",
      description:
        "Shop anytime, anywhere. Our platform is always open for your convenience.",
    },
    {
      icon: Headphones,
      title: "Dedicated Support",
      description:
        "Our customer support team is ready to help you with any questions or issues.",
    },
    {
      icon: Award,
      title: "Authentic Codes",
      description:
        "We guarantee 100% genuine gift cards from official sources only.",
    },
    {
      icon: Lock,
      title: "Privacy Protected",
      description:
        "Your personal and payment information is safe and never shared with third parties.",
    },
  ];

  return (
    <div className="bg-[#16112c] text-white py-16 sm:py-24 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-64 h-64 bg-[#1c75bc] rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#1c75bc] rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Why Choose PakCards?
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Experience the best gift card shopping platform with unmatched
            service and security
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              {/* Icon */}
              <div className="w-14 h-14 bg-[#1c75bc]/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#1c75bc]/30 transition-colors">
                <feature.icon className="w-7 h-7 text-[#1c75bc]" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-16 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#1c75bc] mb-2">500+</div>
              <div className="text-sm text-gray-400">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#1c75bc] mb-2">
                99.9%
              </div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#1c75bc] mb-2">
                &lt;5min
              </div>
              <div className="text-sm text-gray-400">Avg Delivery Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#1c75bc] mb-2">4.8★</div>
              <div className="text-sm text-gray-400">Customer Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;
