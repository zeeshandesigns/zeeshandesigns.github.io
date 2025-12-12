"use client";
import React from "react";
import { Star, Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Ahmed Khan",
      role: "Gamer",
      rating: 5,
      text: "Best place to buy PlayStation gift cards! Instant delivery and great prices. I've been using PakCards for months now.",
      avatar: "👨",
    },
    {
      name: "Sarah Ali",
      role: "Parent",
      rating: 5,
      text: "Bought Roblox cards for my kids. The whole process was super easy and the codes worked perfectly. Highly recommended!",
      avatar: "👩",
    },
    {
      name: "Hassan Malik",
      role: "Student",
      rating: 5,
      text: "Fast delivery, secure payment, and excellent customer support. Got my Steam wallet code within minutes!",
      avatar: "👨‍🎓",
    },
    {
      name: "Fatima Siddiqui",
      role: "Shopper",
      rating: 5,
      text: "Love the variety of gift cards available. Amazon and iTunes cards are always in stock. Great service!",
      avatar: "👩‍💼",
    },
  ];

  return (
    <div className="bg-gray-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#16112c] mb-4">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our satisfied customers
            have to say.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10">
                <Quote className="w-16 h-16 text-[#1c75bc]" />
              </div>

              <div className="relative">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Text */}
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#1c75bc]/10 rounded-full flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-[#16112c]">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Rating */}
        <div className="mt-16 text-center bg-white rounded-2xl shadow-md p-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-8 h-8 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
          </div>
          <div className="text-3xl font-bold text-[#16112c] mb-2">
            4.9 out of 5
          </div>
          <p className="text-gray-600">Based on 500+ customer reviews</p>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
