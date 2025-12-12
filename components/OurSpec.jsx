import React from "react";
import Title from "./Title";
import { ourSpecsData } from "@/assets/assets";

const OurSpecs = () => {
  return (
    <div className="px-4 sm:px-6 my-16 sm:my-20 max-w-7xl mx-auto">
      <Title
        visibleButton={false}
        title="Why Choose Us"
        description="Fast, secure, and reliable gift card delivery with the best customer service."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7 gap-y-10 mt-12 sm:mt-16">
        {ourSpecsData.map((spec, index) => {
          return (
            <div
              className="relative h-40 sm:h-44 px-6 sm:px-8 flex flex-col items-center justify-center w-full text-center border rounded-lg group"
              style={{
                backgroundColor: spec.accent + 10,
                borderColor: spec.accent + 30,
              }}
              key={index}
            >
              <h3 className="text-slate-800 font-medium text-sm sm:text-base">
                {spec.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 sm:mt-3">
                {spec.description}
              </p>
              <div
                className="absolute -top-4 sm:-top-5 text-white size-9 sm:size-10 flex items-center justify-center rounded-md group-hover:scale-105 transition"
                style={{ backgroundColor: spec.accent }}
              >
                <spec.icon size={18} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OurSpecs;
