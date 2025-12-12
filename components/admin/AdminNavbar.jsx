"use client";
import Link from "next/link";

const AdminNavbar = () => {
  return (
    <div className="flex items-center justify-between px-6 lg:px-12 py-3 border-b border-gray-200 bg-white shadow-sm transition-all">
      <Link href="/admin" className="relative text-3xl lg:text-4xl font-bold">
        <span className="text-[#1c75bc]">Pak</span>
        <span className="text-[#16112c]">Cards</span>
        <span className="text-[#1c75bc] text-4xl lg:text-5xl leading-0">.</span>
        <p className="absolute text-xs font-semibold -top-1 -right-16 px-3 py-1 rounded-full flex items-center gap-2 text-white bg-[#1c75bc]">
          Admin Panel
        </p>
      </Link>
      <div className="flex items-center gap-3">
        <p className="text-[#16112c] font-medium">Admin Dashboard</p>
      </div>
    </div>
  );
};

export default AdminNavbar;
