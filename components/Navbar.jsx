"use client";
import { PackageIcon, Wallet, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useClerk, UserButton } from "@clerk/nextjs";
import WalletButton from "./WalletButton";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const router = useRouter();

  return (
    <nav className="relative bg-white shadow-sm">
      <div className="mx-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">
          <Link
            href="/"
            className="relative text-4xl font-semibold text-[#16112c]"
          >
            <span className="text-[#1c75bc]">Pak</span>Cards
            <span className="text-[#1c75bc] text-5xl leading-0">.</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-[#16112c] font-medium">
            <Link href="/" className="hover:text-[#1c75bc] transition">
              Home
            </Link>

            {user && <WalletButton />}

            {user && <NotificationBell />}

            {!user ? (
              <button
                onClick={openSignIn}
                className="px-8 py-2 bg-[#1c75bc] hover:bg-[#1557a0] transition text-white rounded-full shadow-md hover:shadow-lg"
              >
                Login
              </button>
            ) : (
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="My Wallet"
                    labelIcon={<Wallet size={16} />}
                    onClick={() => router.push("/wallet")}
                  />
                  <UserButton.Action
                    label="My Orders"
                    labelIcon={<PackageIcon size={16} />}
                    onClick={() => router.push("/orders")}
                  />
                  <UserButton.Action
                    label="My Disputes"
                    labelIcon={<MessageCircle size={16} />}
                    onClick={() => router.push("/disputes")}
                  />
                </UserButton.MenuItems>
              </UserButton>
            )}
          </div>

          {/* Mobile User Button  */}
          <div className="sm:hidden flex items-center gap-2">
            {user && <NotificationBell />}

            {user ? (
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="My Wallet"
                    labelIcon={<Wallet size={16} />}
                    onClick={() => router.push("/wallet")}
                  />
                  <UserButton.Action
                    label="My Orders"
                    labelIcon={<PackageIcon size={16} />}
                    onClick={() => router.push("/orders")}
                  />
                  <UserButton.Action
                    label="My Disputes"
                    labelIcon={<MessageCircle size={16} />}
                    onClick={() => router.push("/disputes")}
                  />
                </UserButton.MenuItems>
              </UserButton>
            ) : (
              <button
                onClick={openSignIn}
                className="px-7 py-1.5 bg-[#1c75bc] hover:bg-[#1557a0] text-sm transition text-white rounded-full shadow-md"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
      <hr className="border-gray-200" />
    </nav>
  );
};

export default Navbar;
