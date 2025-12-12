"use client";
import Newsletter from "@/components/Newsletter";
import Categories from "@/components/Categories";
import AdminRedirect from "@/components/AdminRedirect";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import HowItWorks from "@/components/HowItWorks";
import WhyChooseUs from "@/components/WhyChooseUs";
import Testimonials from "@/components/Testimonials";
import { useSelector } from "react-redux";

export default function Home() {
  const products = useSelector((state) => state.product.list);

  return (
    <AdminRedirect>
      <div className="bg-white">
        <Categories />
        <FeaturedProducts />
        <HowItWorks />
        <WhyChooseUs />
        <Testimonials />
        <Newsletter />
      </div>
    </AdminRedirect>
  );
}
