"use client";
import { useState, useEffect } from "react";
import {
  X,
  Copy,
  CheckCircle,
  Package,
  Clock,
  CreditCard,
  MapPin,
  Eye,
  EyeOff,
  Download,
  AlertCircle,
  Zap,
  RefreshCw,
  XCircle,
  ShoppingCart,
  Info,
  AlertTriangle,
  Star,
  MessageCircle,
  Wallet,
} from "lucide-react";
import ReviewModal from "./ReviewModal";
import DisputeChat from "./DisputeChat";

const OrderDetailModal = ({ order, onClose, onReorder, onCancelOrder }) => {
  const [copiedCode, setCopiedCode] = useState(null);
  const [revealedCodes, setRevealedCodes] = useState({});
  const [cancelling, setCancelling] = useState(false);
  const [canDispute, setCanDispute] = useState(false);
  const [hasDispute, setHasDispute] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(null);
  const [showDisputeChat, setShowDisputeChat] = useState(false);
  const [reviewEligibility, setReviewEligibility] = useState({});

  // Check if order can be disputed (within 24 hours)
  useEffect(() => {
    const orderAge = Date.now() - new Date(order.createdAt).getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    setCanDispute(orderAge <= twentyFourHours && order.status !== "cancelled");

    // Check if order already has a dispute
    checkDispute();

    // Check review eligibility for each product
    checkReviewEligibility();
  }, [order]);

  const checkDispute = async () => {
    try {
      const response = await fetch(`/api/orders/${order.id}/dispute`);
      const data = await response.json();
      if (response.ok && data.dispute) {
        setHasDispute(true);
      }
    } catch (error) {
      console.error("Error checking dispute:", error);
    }
  };

  const checkReviewEligibility = async () => {
    if (order.status !== "completed" && order.status !== "CODE_DELIVERED") {
      return;
    }

    const eligibility = {};
    for (const item of order.items) {
      try {
        const response = await fetch(
          `/api/reviews/can-review/${order.id}/${item.productId}`
        );
        const data = await response.json();
        eligibility[item.productId] = data.canReview;
      } catch (error) {
        console.error("Error checking review eligibility:", error);
      }
    }
    setReviewEligibility(eligibility);
  };

  const copyToClipboard = async (code, codeId) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(codeId);
      setTimeout(() => setCopiedCode(null), 2000);

      // Track code view
      await fetch(`/api/orders/${order.id}/view-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeId }),
      });
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const revealCode = (codeId) => {
    setRevealedCodes((prev) => ({ ...prev, [codeId]: true }));
  };

  const handleCancelOrder = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel this order? This action cannot be undone."
      )
    ) {
      return;
    }

    setCancelling(true);
    try {
      if (onCancelOrder) {
        await onCancelOrder(order.id);
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
    } finally {
      setCancelling(false);
    }
  };

  const handleReorder = () => {
    if (onReorder) {
      onReorder(order.items);
    }
  };

  const getRedemptionInstructions = (category) => {
    const instructions = {
      gaming:
        "Visit the gaming platform store, select 'Redeem Code', and enter your code.",
      playstation:
        "Go to PlayStation Store > Redeem Codes > Enter the code above.",
      xbox: "Visit Microsoft Store > Use a code > Enter your 25-character code.",
      steam: "Open Steam > Games > Activate a Product on Steam > Enter code.",
      roblox: "Go to Roblox.com > Gift Cards > Redeem your code for Robux.",
      pubg: "Open PUBG Mobile > Shop > Redeem UC code > Enter the code.",
      netflix: "Visit Netflix.com/redeem > Enter the code and enjoy!",
      spotify: "Go to spotify.com/redeem > Enter code > Activate premium.",
      itunes: "Open App Store/iTunes > Redeem > Enter code.",
      "google-play": "Open Play Store > Menu > Redeem > Enter code.",
    };

    return (
      instructions[category?.toLowerCase()] ||
      "Copy the code and redeem it on the official platform. Visit the product page for detailed instructions."
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "processing":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "pending_verification":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Order Details</h2>
            <p className="text-sm text-slate-500 mt-1">
              Order ID:{" "}
              <span className="font-mono font-semibold">
                #{order.orderNumber}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status & Timeline */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Order Status</h3>
              <div
                className={`px-4 py-2 rounded-full border ${getStatusColor(
                  order.status
                )}`}
              >
                <span className="font-medium capitalize">
                  {order.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {/* Timeline */}
            {order.timeline && order.timeline.length > 0 && (
              <div className="space-y-4">
                {order.timeline.map((event, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          event.completed ? "bg-green-500" : "bg-slate-300"
                        }`}
                      />
                      {idx < order.timeline.length - 1 && (
                        <div
                          className={`w-0.5 flex-1 min-h-8 ${
                            event.completed ? "bg-green-500" : "bg-slate-300"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p
                        className={`font-medium ${
                          event.completed ? "text-slate-800" : "text-slate-500"
                        }`}
                      >
                        {event.status}
                      </p>
                      {event.timestamp && (
                        <p className="text-sm text-slate-500">
                          {formatDate(event.timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Verification Status Alert */}
          {order.status === "pending_verification" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock size={20} className="text-yellow-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 mb-1">
                    Payment Under Review
                  </h3>
                  <p className="text-sm text-yellow-800 mb-2">
                    Your payment is currently being verified by our team. This
                    usually takes 15-30 minutes during business hours.
                  </p>
                  <p className="text-sm text-yellow-700">
                    <strong>Next Steps:</strong> Once verified, your gift card
                    codes will be delivered instantly and you'll receive a
                    notification.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              {order.paymentMethod === "WALLET" ? (
                <Wallet size={20} className="text-green-600" />
              ) : (
                <CreditCard size={20} className="text-slate-600" />
              )}
              <h3 className="font-semibold text-slate-800">
                Payment Information
              </h3>
              {order.isPaid && (
                <span className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle size={12} />
                  Paid
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Payment Method</p>
                <div className="flex items-center gap-2">
                  {order.paymentMethod === "WALLET" && (
                    <Wallet size={16} className="text-green-600" />
                  )}
                  <p className="font-medium text-slate-800 capitalize">
                    {order.paymentMethod === "WALLET"
                      ? "Wallet"
                      : order.paymentMethod.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-slate-500">Total Amount</p>
                <p className="font-semibold text-slate-800 text-lg">
                  ₨{order.totalAmount}
                </p>
              </div>
              {order.paymentMethod === "WALLET" && order.walletTransaction && (
                <div className="col-span-2 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-700 mb-1">
                    Wallet Transaction
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-800">
                      Deducted from wallet
                    </span>
                    <span className="font-semibold text-green-900">
                      -₨{order.totalAmount}
                    </span>
                  </div>
                  {order.walletTransaction.description && (
                    <p className="text-xs text-green-600 mt-1">
                      {order.walletTransaction.description}
                    </p>
                  )}
                </div>
              )}
              {order.paymentProof && (
                <div className="col-span-2">
                  <p className="text-slate-500 mb-2">Payment Proof</p>
                  <a
                    href={order.paymentProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 underline"
                  >
                    <Download size={16} />
                    View Proof
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          {order.address && (
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={20} className="text-slate-600" />
                <h3 className="font-semibold text-slate-800">
                  Delivery Address
                </h3>
              </div>
              <div className="text-sm text-slate-600 space-y-1">
                <p className="font-medium text-slate-800">
                  {order.address.name}
                </p>
                <p>{order.address.phone}</p>
                <p>{order.address.street}</p>
                <p>
                  {order.address.city}, {order.address.state}{" "}
                  {order.address.zip}
                </p>
                <p>{order.address.country}</p>
              </div>
            </div>
          )}

          {/* Order Items & Codes */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Package size={20} className="text-slate-600" />
              <h3 className="font-semibold text-slate-800">Order Items</h3>
            </div>

            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-lg p-4"
                >
                  {/* Item Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={item.images?.[0] || "/placeholder.png"}
                        alt={item.productName}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800 mb-1">
                        {item.productName}
                      </h4>
                      <p className="text-sm text-slate-500 mb-2">
                        {item.productDescription}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-slate-600">
                          Quantity: {item.quantity}
                        </span>
                        <span className="text-slate-600">
                          Price: ₨{item.price} each
                        </span>
                        {item.deliveryType === "instant" && (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <Zap size={14} fill="currentColor" />
                            Instant Delivery
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-800 text-lg">
                        ₨{item.totalPrice}
                      </p>
                    </div>
                  </div>

                  {/* Gift Card Codes */}
                  {item.codes && item.codes.length > 0 ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-green-800 flex items-center gap-2">
                          <CheckCircle size={16} />
                          Gift Card Codes ({item.codes.length}/{item.quantity})
                        </h5>
                        {item.allCodesDelivered && (
                          <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                            All Delivered
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        {item.codes.map((codeItem) => (
                          <div
                            key={codeItem.id}
                            className="bg-white border border-green-200 rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex-1">
                                {revealedCodes[codeItem.id] ? (
                                  <code className="block font-mono text-sm bg-slate-100 px-3 py-2 rounded border border-slate-300">
                                    {codeItem.code}
                                  </code>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <code className="block font-mono text-sm bg-slate-100 px-3 py-2 rounded border border-slate-300 blur-sm select-none">
                                      XXXX-XXXX-XXXX-XXXX
                                    </code>
                                    <button
                                      onClick={() => revealCode(codeItem.id)}
                                      className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
                                    >
                                      <Eye size={14} />
                                      Reveal
                                    </button>
                                  </div>
                                )}
                                <p className="text-xs text-slate-500 mt-1">
                                  Delivered: {formatDate(codeItem.deliveredAt)}
                                  {codeItem.viewedAt && (
                                    <>
                                      {" "}
                                      • Viewed: {formatDate(codeItem.viewedAt)}
                                    </>
                                  )}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  copyToClipboard(codeItem.code, codeItem.id)
                                }
                                disabled={!revealedCodes[codeItem.id]}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                                  revealedCodes[codeItem.id]
                                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                }`}
                              >
                                {copiedCode === codeItem.id ? (
                                  <>
                                    <CheckCircle size={16} />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={16} />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Redemption Instructions */}
                      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Info
                            size={16}
                            className="text-blue-600 shrink-0 mt-0.5"
                          />
                          <div className="text-sm">
                            <p className="font-medium text-blue-900 mb-1">
                              How to Redeem Your Code
                            </p>
                            <p className="text-blue-800">
                              {getRedemptionInstructions(item.category)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Redemption Instructions */}
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-800 font-medium mb-1">
                          💡 How to Redeem:
                        </p>
                        <p className="text-xs text-blue-700">
                          Copy the code above and redeem it on the official
                          platform. For detailed instructions, visit the product
                          page.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                      <Clock
                        size={20}
                        className="text-yellow-600 shrink-0 mt-0.5"
                      />
                      <div>
                        <p className="font-medium text-yellow-800 mb-1">
                          Codes Pending
                        </p>
                        <p className="text-sm text-yellow-700">
                          {item.deliveryType === "instant"
                            ? "Your codes will be delivered shortly after payment verification."
                            : "Your codes will be delivered manually by our team within 24 hours."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Review Button */}
                  {reviewEligibility[item.productId] && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => setShowReviewModal(item)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded-lg transition w-full justify-center"
                      >
                        <Star size={16} />
                        <span>Write a Review</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="text-slate-800">₨{order.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Discount</span>
                <span className="text-green-600">-₨0</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-300">
                <span className="font-semibold text-slate-800">Total</span>
                <span className="font-bold text-slate-800 text-lg">
                  ₨{order.totalAmount}
                </span>
              </div>
            </div>
          </div>

          {/* Order Summary Stats */}
          {order.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-slate-800">
                  {order.summary.totalItems}
                </p>
                <p className="text-sm text-slate-500">Items</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-slate-800">
                  {order.summary.totalQuantity}
                </p>
                <p className="text-sm text-slate-500">Quantity</p>
              </div>
              <div className="bg-white border border-green-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {order.summary.codesDelivered}
                </p>
                <p className="text-sm text-slate-500">Codes Delivered</p>
              </div>
              <div className="bg-white border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {order.summary.codesViewed}
                </p>
                <p className="text-sm text-slate-500">Codes Viewed</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              Order placed on {formatDate(order.createdAt)}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Open Dispute Button - Available within 24 hours */}
              {canDispute && !hasDispute && (
                <button
                  onClick={() => {
                    onClose();
                    window.location.href = `/disputes/create?orderId=${order.id}`;
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 hover:text-orange-700 border border-orange-200 rounded-lg transition"
                >
                  <AlertTriangle size={16} />
                  <span>Open Dispute</span>
                </button>
              )}

              {/* Dispute Already Opened */}
              {hasDispute && (
                <button
                  onClick={() => setShowDisputeChat(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1c75bc] hover:bg-[#1557a0] text-white border border-[#1c75bc] rounded-lg transition font-medium"
                >
                  <MessageCircle size={16} />
                  <span>View Dispute Chat</span>
                </button>
              )}

              {/* Cancel Order Button - Only for pending/processing orders */}
              {(order.status === "pending_verification" ||
                order.status === "processing") && (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={16} />
                      <span>Cancel Order</span>
                    </>
                  )}
                </button>
              )}

              {/* Reorder Button - Always available unless cancelled */}
              {order.status !== "cancelled" && (
                <button
                  onClick={handleReorder}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                >
                  <RefreshCw size={16} />
                  <span>Reorder</span>
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          orderId={order.id}
          productId={showReviewModal.productId}
          productName={showReviewModal.productName}
          onClose={() => setShowReviewModal(null)}
          onSuccess={() => {
            setShowReviewModal(null);
            checkReviewEligibility();
          }}
        />
      )}

      {/* Dispute Chat Modal */}
      {showDisputeChat && (
        <DisputeChat
          orderId={order.id}
          onClose={() => setShowDisputeChat(false)}
        />
      )}
    </div>
  );
};

export default OrderDetailModal;
