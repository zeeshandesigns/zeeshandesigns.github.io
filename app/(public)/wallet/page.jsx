"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  History,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Loading from "@/components/Loading";
import TopUpModal from "@/components/TopUpModal";

export default function WalletPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [filter, setFilter] = useState("all"); // all, credit, debit, pending

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "Rs";

  useEffect(() => {
    if (userId) {
      fetchWalletData();
      fetchPendingPayments();
    }
  }, [userId]);

  const fetchWalletData = async () => {
    try {
      const response = await fetch("/api/wallet");
      const data = await response.json();

      if (response.ok) {
        setWalletData(data.wallet);
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const response = await fetch("/api/wallet/pending-topups");
      const data = await response.json();

      if (response.ok) {
        setPendingPayments(data.pendingTopups || []);
      }
    } catch (error) {
      console.error("Failed to fetch pending payments:", error);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "TOP_UP":
      case "REFUND":
        return <ArrowDownRight className="text-green-600" size={20} />;
      case "ORDER_PAYMENT":
      case "DEDUCTION":
        return <ArrowUpRight className="text-red-600" size={20} />;
      default:
        return <History className="text-gray-600" size={20} />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
            <CheckCircle size={14} />
            Completed
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
            <Clock size={14} />
            Pending
          </span>
        );
      case "FAILED":
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
            <XCircle size={14} />
            {status === "FAILED" ? "Failed" : "Rejected"}
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "all") return true;
    if (filter === "credit") return ["TOP_UP", "REFUND"].includes(t.type);
    if (filter === "debit")
      return ["ORDER_PAYMENT", "DEDUCTION"].includes(t.type);
    if (filter === "pending") return t.status === "PENDING";
    return true;
  });

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-[#1c75bc] mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-[#16112c] mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to access your wallet.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-[#1c75bc] text-white px-6 py-3 rounded-lg hover:bg-[#1557a0] transition"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#16112c] mb-2">My Wallet</h1>
          <p className="text-gray-600">
            Manage your balance, view transactions, and track pending payments
          </p>
        </div>

        {/* Wallet Balance Card */}
        <div className="bg-linear-to-br from-[#16112c] to-[#1c75bc] rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Wallet size={32} />
              </div>
              <div>
                <p className="text-white/80 text-sm">Total Balance</p>
                <h2 className="text-4xl font-bold">
                  {currency} {walletData?.balance?.toFixed(2) || "0.00"}
                </h2>
              </div>
            </div>
            <button
              onClick={() => setShowTopUpModal(true)}
              className="flex items-center gap-2 bg-white text-[#1c75bc] px-6 py-3 rounded-lg hover:bg-white/90 transition font-semibold"
            >
              <Plus size={20} />
              Top Up
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/20">
            <div>
              <p className="text-white/80 text-sm mb-1">Total Spent</p>
              <p className="text-xl font-semibold">
                {currency}{" "}
                {transactions
                  .filter((t) =>
                    ["ORDER_PAYMENT", "DEDUCTION"].includes(t.type)
                  )
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                  .toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-white/80 text-sm mb-1">Total Added</p>
              <p className="text-xl font-semibold">
                {currency}{" "}
                {transactions
                  .filter((t) => ["TOP_UP", "REFUND"].includes(t.type))
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Pending Payments Section */}
        {pendingPayments.length > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="text-yellow-700" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#16112c] mb-2">
                  Pending Top-Ups ({pendingPayments.length})
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  Your payment submissions are being verified by our admin team.
                  This usually takes a few minutes to a few hours.
                </p>
                <div className="space-y-3">
                  {pendingPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="bg-white rounded-lg p-4 border border-yellow-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-[#16112c]">
                              {currency} {payment.amount.toFixed(2)}
                            </span>
                            {getStatusBadge(payment.status)}
                          </div>
                          <p className="text-sm text-gray-600">
                            Submitted on{" "}
                            {new Date(payment.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Reference</p>
                          <p className="text-sm font-mono text-gray-700">
                            #{payment.id.substring(0, 8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-[#1c75bc]" size={24} />
                <h3 className="text-xl font-semibold text-[#16112c]">
                  Transaction History
                </h3>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              {[
                { value: "all", label: "All" },
                { value: "credit", label: "Credits" },
                { value: "debit", label: "Debits" },
                { value: "pending", label: "Pending" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === tab.value
                      ? "bg-[#1c75bc] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-semibold text-[#16112c]">
                          {transaction.type
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </p>
                        {transaction.description && (
                          <p className="text-xs text-gray-500 mt-1">
                            {transaction.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          ["TOP_UP", "REFUND"].includes(transaction.type)
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {["TOP_UP", "REFUND"].includes(transaction.type)
                          ? "+"
                          : "-"}
                        {currency} {Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No transactions found</p>
                <p className="text-sm text-gray-400 mt-2">
                  {filter !== "all"
                    ? "Try changing the filter"
                    : "Start by adding funds to your wallet"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertCircle className="text-blue-700" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-[#16112c] mb-2">
                How Wallet Works
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Add funds to your wallet using bank transfer</li>
                <li>
                  • Submit payment proof and wait for admin verification
                  (usually within a few hours)
                </li>
                <li>• Once verified, funds are added to your wallet balance</li>
                <li>• Use wallet balance to purchase gift cards instantly</li>
                <li>• All transactions are recorded in your history</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Top Up Modal */}
      <TopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onSuccess={() => {
          setShowTopUpModal(false);
          fetchWalletData();
          fetchPendingPayments();
        }}
      />
    </div>
  );
}
