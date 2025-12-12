"use client";
import { useState, useEffect } from "react";
import { Wallet, Loader2 } from "lucide-react";
import WalletModal from "./WalletModal";

const WalletButton = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "Rs";

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await fetch("/api/wallet");
      const data = await response.json();

      if (response.ok) {
        setBalance(data.wallet.balance);
      }
    } catch (error) {
      console.error("Failed to fetch wallet balance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    fetchBalance(); // Refresh balance when modal closes
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-[#1c75bc]/10 hover:bg-[#1c75bc]/20 text-[#1c75bc] rounded-full transition border border-[#1c75bc]/30"
      >
        <Wallet size={18} />
        {loading ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <span className="font-semibold">
            {currency} {balance?.toFixed(2) || "0.00"}
          </span>
        )}
      </button>

      <WalletModal isOpen={showModal} onClose={handleModalClose} />
    </>
  );
};

export default WalletButton;
