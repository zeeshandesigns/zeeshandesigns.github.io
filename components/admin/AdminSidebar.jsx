"use client";

import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ShieldCheckIcon,
  StoreIcon,
  TicketPercentIcon,
  FolderIcon,
  PackageIcon,
  GlobeIcon,
  UsersIcon,
  CreditCardIcon,
  AlertTriangle,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { assets } from "@/assets/assets";

const AdminSidebar = () => {
  const pathname = usePathname();

  const sidebarLinks = [
    { name: "Dashboard", href: "/admin", icon: HomeIcon },
    { name: "Wallet Top-Ups", href: "/admin/wallet-topups", icon: Wallet },
    { name: "Payments", href: "/admin/payments", icon: CreditCardIcon },
    { name: "Disputes", href: "/admin/disputes", icon: AlertTriangle },
    { name: "Categories", href: "/admin/categories", icon: FolderIcon },
    { name: "Regions", href: "/admin/regions", icon: GlobeIcon },
    { name: "Products", href: "/admin/products", icon: StoreIcon },
    { name: "Orders", href: "/admin/orders", icon: PackageIcon },
    { name: "Customers", href: "/admin/customers", icon: UsersIcon },
    { name: "Coupons", href: "/admin/coupons", icon: TicketPercentIcon },
  ];

  return (
    <div className="inline-flex h-full flex-col gap-5 border-r border-gray-200 bg-white sm:min-w-60">
      <div className="flex flex-col gap-3 justify-center items-center pt-8 pb-4 border-b border-gray-200 max-sm:hidden">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1c75bc] to-[#16112c] flex items-center justify-center shadow-lg">
          <span className="text-white text-2xl font-bold">PC</span>
        </div>
        <div className="text-center">
          <p className="text-[#16112c] font-bold text-lg">Pak Cards</p>
          <p className="text-gray-500 text-xs">Admin Panel</p>
        </div>
      </div>

      <div className="max-sm:mt-6">
        {sidebarLinks.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className={`relative flex items-center gap-3 text-gray-600 hover:bg-[#1c75bc]/10 hover:text-[#1c75bc] p-2.5 transition ${
              pathname === link.href &&
              "bg-[#1c75bc]/10 text-[#1c75bc] font-medium"
            }`}
          >
            <link.icon size={18} className="sm:ml-5" />
            <p className="max-sm:hidden">{link.name}</p>
            {pathname === link.href && (
              <span className="absolute bg-[#1c75bc] right-0 top-1.5 bottom-1.5 w-1 sm:w-1.5 rounded-l"></span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminSidebar;
