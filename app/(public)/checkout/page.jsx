"use client";
import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useState } from "react";
import Image from "next/image";
import { useAuth, useUser } from "@clerk/nextjs";

import {
  CheckCircle2Icon,
  ArrowLeftIcon,
  AlertCircle,
  Wallet,
} from "lucide-react";
import TopUpModal from "@/components/TopUpModal";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const router = useRouter();
  const { userId } = useAuth();
  const { user } = useUser();

  const products = useSelector((state) => state.product.list);
  const product = products.find((p) => p.id === productId);

  const [walletBalance, setWalletBalance] = useState(null);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [deliveredCodes, setDeliveredCodes] = useState([]);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "Rs";

  useEffect(() => {
    setMounted(true);
    if (userId) {
      fetchWalletBalance();
    }
  }, [userId]);

  const fetchWalletBalance = async () => {
    try {
      const response = await fetch("/api/wallet");
      const data = await response.json();

      if (response.ok) {
        setWalletBalance(data.wallet.balance);
      }
    } catch (error) {
      console.error("Failed to fetch wallet balance:", error);
    }
  };

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-64 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show message if not authenticated
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-[#1c75bc] mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-[#16112c] mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be signed in to complete your order. Please sign in or
            create an account to continue.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-[#1c75bc] text-white px-6 py-3 rounded-lg hover:bg-[#1557a0] transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">
            Product not found
          </h2>
          <button
            onClick={() => router.push("/")}
            className="text-[#1c75bc] hover:text-[#1557a0] flex items-center gap-2 mx-auto"
          >
            <ArrowLeftIcon size={20} />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate user is logged in
      if (!userId || !user) {
        setError("You must be logged in to place an order");
        setLoading(false);
        return;
      }

      // Check wallet balance
      if (walletBalance === null || walletBalance < product.price) {
        setError("Insufficient wallet balance. Please top up your wallet.");
        setLoading(false);
        setShowTopUpModal(true);
        return;
      }

      // Create FormData with user info from Clerk
      const formDataToSend = new FormData();

      // Add order items
      formDataToSend.append(
        "items",
        JSON.stringify([
          {
            productId: product.id,
            quantity: 1,
            price: product.price,
          },
        ])
      );

      // Add address from Clerk user data
      formDataToSend.append(
        "address",
        JSON.stringify({
          name: user.fullName || user.firstName || "Customer",
          email:
            user.primaryEmailAddress?.emailAddress ||
            user.emailAddresses?.[0]?.emailAddress ||
            "",
          phone:
            user.primaryPhoneNumber?.phoneNumber ||
            user.phoneNumbers?.[0]?.phoneNumber ||
            "N/A",
          street: "N/A",
          city: "N/A",
          state: "N/A",
          zip: "00000",
          country: "Pakistan",
        })
      );

      // Send to API
      const response = await fetch("/api/orders/create", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error && data.error.includes("Insufficient wallet balance")) {
          setShowTopUpModal(true);
        }
        throw new Error(data.error || "Failed to create order");
      }

      // Success!
      setOrderId(data.order.id);

      // Set delivered codes if available (for instant delivery)
      if (data.order.codesDelivered && data.order.codes) {
        setDeliveredCodes(data.order.codes);
      }

      setOrderPlaced(true);
    } catch (err) {
      console.error("Order creation error:", err);
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-green-100">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl shadow-xl">
          <div className="flex justify-center mb-6">
            <CheckCircle2Icon size={80} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Order Placed Successfully!
          </h2>
          <p className="text-slate-600 mb-2">
            Your order has been confirmed and paid via wallet.
          </p>
          <div className="bg-slate-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-slate-500">Order ID:</p>
            <p className="font-mono text-sm font-semibold text-slate-800 mb-3">
              {orderId}
            </p>
            <p className="text-sm text-slate-500">Product:</p>
            <p className="font-semibold text-slate-800">{product.name}</p>
            <p className="text-lg font-bold text-green-600 mt-2">
              {currency}
              {product.price}
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              ✅ Payment deducted from wallet
              <br />
              {deliveredCodes.length > 0 ? (
                <>📧 Your codes are displayed below</>
              ) : (
                <>📧 Check your order page for gift card codes</>
              )}
              <br />⚡ Instant delivery for available products
            </p>
          </div>

          {/* Display Codes if Available */}
          {deliveredCodes.length > 0 && (
            <div className="bg-blue-50 border-2 border-[#1c75bc] rounded-lg p-6 mb-6">
              <h3 className="font-bold text-[#16112c] mb-4 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-[#1c75bc]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Your Gift Card Code{deliveredCodes.length > 1 ? "s" : ""}
              </h3>
              <div className="space-y-3">
                {deliveredCodes.map((code, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg border border-gray-200"
                  >
                    <p className="text-xs text-gray-500 mb-1">
                      Code #{index + 1}
                    </p>
                    <div className="flex items-center justify-between">
                      <code className="text-lg font-mono font-bold text-[#16112c] bg-gray-50 px-3 py-2 rounded">
                        {code}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(code);
                          alert("Code copied to clipboard!");
                        }}
                        className="text-[#1c75bc] hover:text-[#1557a0] text-sm font-medium"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-4 text-center">
                💡 Save these codes! You can also view them anytime in your
                orders page.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => router.push("/orders")}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
            >
              View My Orders
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-slate-100 text-slate-700 py-3 rounded-lg hover:bg-slate-200 transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => router.back()}
          className="text-[#16112c] hover:text-[#1c75bc] flex items-center gap-2 mb-6 font-medium transition"
        >
          <ArrowLeftIcon size={20} />
          Back
        </button>

        <h1 className="text-3xl font-bold text-[#16112c] mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Confirmation */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle
                    className="text-red-600 shrink-0 mt-0.5"
                    size={20}
                  />
                  <div>
                    <p className="text-sm font-semibold text-red-800">Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-xl font-semibold text-[#16112c] mb-4">
                  Order Information
                </h2>
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#16112c] font-medium">
                      Customer Name:
                    </span>
                    <span className="text-sm text-gray-700">
                      {user?.fullName || user?.firstName || "Customer"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#16112c] font-medium">
                      Email:
                    </span>
                    <span className="text-sm text-gray-700">
                      {user?.primaryEmailAddress?.emailAddress ||
                        user?.emailAddresses?.[0]?.emailAddress}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#16112c] font-medium">
                      Phone:
                    </span>
                    <span className="text-sm text-gray-700">
                      {user?.primaryPhoneNumber?.phoneNumber ||
                        user?.phoneNumbers?.[0]?.phoneNumber ||
                        "Not provided"}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <p className="text-xs text-gray-500">
                      ℹ️ Digital codes will be sent to your email address after
                      payment confirmation.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-[#16112c] mb-4">
                  Payment Method
                </h2>
                <div className="bg-[#1c75bc]/10 border border-[#1c75bc]/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#1c75bc] p-2 rounded-lg">
                        <Wallet className="text-white" size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-[#16112c]">
                          Pay with Wallet
                        </p>
                        <p className="text-sm text-gray-600">
                          Current Balance: {currency}{" "}
                          {walletBalance?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                    </div>
                    {walletBalance !== null &&
                      walletBalance < product.price && (
                        <button
                          type="button"
                          onClick={() => setShowTopUpModal(true)}
                          className="bg-[#1c75bc] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1557a0] transition"
                        >
                          Top Up
                        </button>
                      )}
                  </div>
                </div>

                {walletBalance !== null && walletBalance < product.price && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Insufficient balance! You need {currency}{" "}
                      {(product.price - walletBalance).toFixed(2)} more to
                      complete this order.
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={
                  loading ||
                  (walletBalance !== null && walletBalance < product.price)
                }
                className="w-full bg-[#1c75bc] text-white py-4 rounded-lg hover:bg-[#1557a0] transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Processing..."
                  : walletBalance !== null && walletBalance < product.price
                  ? "Insufficient Balance - Top Up Required"
                  : `Place Order - ${currency}${product.price}`}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Order Summary
              </h2>

              <div className="flex gap-4 mb-6">
                <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  {product.images && product.images[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={60}
                      height={60}
                      className="object-contain"
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-slate-800 text-sm">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Digital Gift Card
                  </p>
                  <p className="text-sm font-semibold text-slate-800 mt-2">
                    {currency}
                    {product.price}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium text-slate-800">
                    {currency}
                    {product.price}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="font-medium text-[#1c75bc]">FREE</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-lg font-semibold text-[#16112c]">
                    Total
                  </span>
                  <span className="text-xl font-bold text-[#1c75bc]">
                    {currency}
                    {product.price}
                  </span>
                </div>
              </div>

              <div className="mt-6 bg-[#1c75bc]/10 border border-[#1c75bc]/30 rounded-lg p-4">
                <p className="text-xs text-[#16112c]">
                  ✓ Instant delivery for available products
                  <br />
                  ✓ 100% secure wallet transaction
                  <br />✓ Original gift card codes
                </p>
              </div>
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
          fetchWalletBalance();
        }}
      />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading checkout...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
