import React from "react";
import { Mail } from "lucide-react";

const Newsletter = () => {
  return (
    <div className="bg-[#16112c] py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 sm:p-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1c75bc]/20 rounded-2xl mb-6">
            <Mail className="w-8 h-8 text-[#1c75bc]" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Stay in the Loop
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Get notified about new gift cards, exclusive deals, and special
            offers delivered straight to your inbox.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#1c75bc] focus:bg-white/15 transition-all"
              type="email"
              placeholder="Enter your email"
            />
            <button className="bg-[#1c75bc] hover:bg-[#1557a0] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 whitespace-nowrap">
              Subscribe Now
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-6">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
