"use client";
import { useState, useEffect } from "react";
import { WalletIcon, X, Plus, History, Loader2 } from "lucide-react";
import TopUpModal from "./TopUpModal";

const WalletModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("balance");
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "Rs";

  useEffect(() => {
    if (isOpen) {
      fetchWalletData();
    }
  }, [isOpen]);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/wallet");
      const data = await response.json();

      if (response.ok) {
        setWallet(data.wallet);
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopUpSuccess = () => {
    setShowTopUpModal(false);
    fetchWalletData(); // Refresh wallet data
  };

  if (!isOpen) return null;

  const getTransactionColor = (type) => {
    switch (type) {
      case "TOP_UP":
      case "REFUND":
      case "ADMIN_CREDIT":
        return "text-green-600";
      case "PURCHASE":
      case "ADMIN_DEBIT":
        return "text-red-600";
      default:
        return "text-slate-600";
    }
  };

  const getTransactionSign = (type) => {
    switch (type) {
      case "TOP_UP":
      case "REFUND":
      case "ADMIN_CREDIT":
        return "+";
      case "PURCHASE":
      case "ADMIN_DEBIT":
        return "-";
      default:
        return "";
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-green-600 to-green-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <WalletIcon size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">My Wallet</h2>
                  {wallet && (
                    <p className="text-green-100 text-sm">
                      Balance: {currency} {wallet.balance.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab("balance")}
              className={`flex-1 px-6 py-4 font-medium transition ${
                activeTab === "balance"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Balance
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex-1 px-6 py-4 font-medium transition ${
                activeTab === "transactions"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Transactions
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-96">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-green-600" size={32} />
              </div>
            ) : (
              <>
                {/* Balance Tab */}
                {activeTab === "balance" && wallet && (
                  <div className="space-y-6">
                    <div className="bg-linear-to-br from-green-50 to-green-100 rounded-xl p-8 text-center">
                      <p className="text-slate-600 text-sm mb-2">
                        Available Balance
                      </p>
                      <p className="text-5xl font-bold text-green-600 mb-6">
                        {currency} {wallet.balance.toFixed(2)}
                      </p>
                      <button
                        onClick={() => setShowTopUpModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2 mx-auto"
                      >
                        <Plus size={20} />
                        Top Up Wallet
                      </button>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>💡 How to use your wallet:</strong>
                        <br />
                        1. Top up your wallet using bank transfer
                        <br />
                        2. Your payment will be verified within 24 hours
                        <br />
                        3. Use your wallet balance to purchase products
                        instantly
                        <br />
                        4. No need to upload payment proof for each order!
                      </p>
                    </div>
                  </div>
                )}

                {/* Transactions Tab */}
                {activeTab === "transactions" && (
                  <div className="space-y-3">
                    {transactions.length === 0 ? (
                      <div className="text-center py-12">
                        <History
                          className="mx-auto text-slate-300 mb-4"
                          size={48}
                        />
                        <p className="text-slate-500">No transactions yet</p>
                        <p className="text-sm text-slate-400 mt-2">
                          Your transaction history will appear here
                        </p>
                      </div>
                    ) : (
                      transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-slate-800">
                                {transaction.description}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {new Date(
                                  transaction.createdAt
                                ).toLocaleString()}
                              </p>
                              <div className="flex gap-4 mt-2 text-xs text-slate-600">
                                <span>
                                  Before: {currency}{" "}
                                  {transaction.balanceBefore.toFixed(2)}
                                </span>
                                <span>→</span>
                                <span>
                                  After: {currency}{" "}
                                  {transaction.balanceAfter.toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={`text-lg font-bold ${getTransactionColor(
                                  transaction.type
                                )}`}
                              >
                                {getTransactionSign(transaction.type)}
                                {currency} {transaction.amount.toFixed(2)}
                              </p>
                              <span className="text-xs bg-slate-200 px-2 py-1 rounded">
                                {transaction.type.replace(/_/g, " ")}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Top Up Modal */}
      <TopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onSuccess={handleTopUpSuccess}
      />
    </>
  );
};

export default WalletModal;
