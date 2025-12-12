"use client";
import { useState, useEffect } from "react";
import { Search, Eye, CheckCircle, XCircle, Send, Package } from "lucide-react";
import Loading from "@/components/Loading";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [codesInput, setCodesInput] = useState("");
  const [uploadingCodes, setUploadingCodes] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      if (res.ok) setOrders(data.orders);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, reason = null) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejectionReason: reason }),
      });
      if (res.ok) {
        alert("Status updated!");
        fetchOrders();
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const uploadManualCodes = async (id) => {
    if (!codesInput.trim()) {
      alert("Please enter codes (one per line)");
      return;
    }

    const codes = codesInput
      .split("\n")
      .map((c) => c.trim())
      .filter((c) => c);
    if (codes.length === 0) {
      alert("No valid codes found");
      return;
    }

    if (!confirm(`Upload ${codes.length} code(s)?`)) return;

    setUploadingCodes(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}/upload-codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Successfully uploaded ${codes.length} codes!`);
        setCodesInput("");
        fetchOrders();
        setSelectedOrder(null);
      } else {
        alert(data.error || "Failed to upload codes");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to upload codes");
    } finally {
      setUploadingCodes(false);
    }
  };

  const viewDetails = async (id) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      const data = await res.json();
      if (res.ok) setSelectedOrder(data.order);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const statusColor = (s) =>
    ({
      ORDER_PLACED: "bg-blue-100 text-blue-700",
      PAYMENT_SUBMITTED: "bg-yellow-100 text-yellow-700",
      PAYMENT_VERIFIED: "bg-green-100 text-green-700",
      AWAITING_CODES: "bg-purple-100 text-purple-700",
      PAYMENT_REJECTED: "bg-red-100 text-red-700",
      CODE_DELIVERED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
    }[s] || "bg-gray-100 text-gray-700");

  if (loading) return <Loading />;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#16112c]">Order Management</h1>
        <p className="text-gray-500 mt-1">
          Manage customer orders and delivery codes
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && fetchOrders()}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c75bc] focus:border-transparent"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c75bc] focus:border-transparent"
        >
          <option value="all">All Statuses</option>
          <option value="ORDER_PLACED">Order Placed</option>
          <option value="PAYMENT_VERIFIED">Payment Verified</option>
          <option value="CODE_DELIVERED">Code Delivered</option>
        </select>
        <button
          onClick={fetchOrders}
          className="bg-[#1c75bc] text-white px-4 py-2 rounded-lg hover:bg-[#1557a0] transition font-medium"
        >
          <Search size={18} className="inline mr-2" />
          Search
        </button>
      </div>

      {/* Info Banner */}
      <div className="mb-6 bg-blue-50 border-l-4 border-[#1c75bc] p-4 rounded-r-lg">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-[#1c75bc] mt-0.5 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm">
            <p className="font-semibold text-[#16112c] mb-1">
              Delivery Process:
            </p>
            <ul className="text-gray-700 space-y-1">
              <li>
                • <strong>Instant Delivery:</strong> Codes automatically
                delivered when payment verified
              </li>
              <li>
                • <strong>Manual Delivery:</strong> You must upload codes
                manually for these orders (status: AWAITING_CODES)
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#16112c] uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#16112c] uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#16112c] uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#16112c] uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#16112c] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm font-mono text-[#1c75bc] font-medium">
                  #{order.id.substring(0, 8).toUpperCase()}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {order.user.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.user.email}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-[#16112c]">
                  ₨{order.total.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${statusColor(
                      order.status
                    )}`}
                  >
                    {order.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => viewDetails(order.id)}
                      className="p-2 text-[#1c75bc] hover:bg-[#1c75bc]/10 rounded-lg transition"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>

                    {/* Status-based actions */}
                    {order.status === "PAYMENT_SUBMITTED" && (
                      <>
                        <button
                          onClick={() =>
                            updateStatus(order.id, "PAYMENT_VERIFIED")
                          }
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Verify Payment"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt("Rejection reason:");
                            if (reason)
                              updateStatus(
                                order.id,
                                "PAYMENT_REJECTED",
                                reason
                              );
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Reject Payment"
                        >
                          <XCircle size={18} />
                        </button>
                      </>
                    )}

                    {/* Show Upload Codes button for manual delivery orders that need codes */}
                    {(order.status === "AWAITING_CODES" ||
                      order.status === "PAYMENT_VERIFIED" ||
                      order.status === "ORDER_PLACED") &&
                      order.isPaid && (
                        <button
                          onClick={() => viewDetails(order.id)}
                          className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition flex items-center gap-1"
                          title="Upload Codes"
                        >
                          <Send size={14} />
                          Upload Codes
                        </button>
                      )}

                    {order.status === "CODE_DELIVERED" && (
                      <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-lg flex items-center gap-1">
                        <CheckCircle size={14} />
                        Completed
                      </span>
                    )}

                    {order.status === "PAYMENT_REJECTED" && (
                      <span className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg flex items-center gap-1">
                        <XCircle size={14} />
                        Rejected
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">No orders found</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-linear-to-r from-[#16112c] to-[#1c75bc]">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Order #{selectedOrder.id.substring(0, 8).toUpperCase()}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  {new Date(selectedOrder.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setCodesInput("");
                }}
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Customer */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-[#16112c] mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-[#1c75bc]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Customer Information
                </h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Name:</span>{" "}
                    {selectedOrder.user.name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Email:</span>{" "}
                    {selectedOrder.user.email}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-[#16112c] mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-[#1c75bc]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Order Items
                </h3>
                {selectedOrder.orderItems.map((item) => (
                  <div
                    key={item.productId}
                    className="bg-white border border-gray-200 p-4 rounded-lg mb-3 hover:border-[#1c75bc] transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-[#16112c]">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Quantity: {item.quantity} × ₨{item.price}
                        </p>
                        <span
                          className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                            item.product.deliveryType === "instant"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {item.product.deliveryType === "instant"
                            ? "⚡ Instant Delivery"
                            : "📦 Manual Delivery"}
                        </span>
                      </div>
                      <p className="font-bold text-[#1c75bc] text-lg">
                        ₨{(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700">
                    Order Total:
                  </span>
                  <span className="text-2xl font-bold text-[#1c75bc]">
                    ₨{selectedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>
              {/* Actions */}
              <div className="space-y-4">
                {/* Manual Code Upload for Manual Delivery */}
                {selectedOrder.isPaid &&
                  (selectedOrder.status === "AWAITING_CODES" ||
                    selectedOrder.status === "PAYMENT_VERIFIED" ||
                    selectedOrder.status === "ORDER_PLACED") &&
                  selectedOrder.orderItems.some(
                    (item) => item.product.deliveryType === "manual"
                  ) && (
                    <div className="border-t border-gray-200 pt-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h3 className="font-bold text-[#16112c] mb-2 flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-[#1c75bc]"
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
                          Upload Gift Card Codes
                        </h3>

                        {/* Show required quantity */}
                        <div className="mb-3 bg-white border border-blue-300 rounded-lg p-3">
                          <div className="text-sm font-semibold text-[#16112c] mb-2">
                            Required Codes:
                          </div>
                          {selectedOrder.orderItems
                            .filter(
                              (item) => item.product.deliveryType === "manual"
                            )
                            .map((item) => (
                              <div
                                key={item.productId}
                                className="flex justify-between items-center text-sm py-1"
                              >
                                <span className="text-gray-700">
                                  {item.product.name}
                                </span>
                                <span className="font-bold text-[#1c75bc]">
                                  {item.quantity}{" "}
                                  {item.quantity === 1 ? "code" : "codes"}
                                </span>
                              </div>
                            ))}
                          <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center font-bold">
                            <span className="text-gray-900">Total:</span>
                            <span className="text-[#1c75bc]">
                              {selectedOrder.orderItems
                                .filter(
                                  (item) =>
                                    item.product.deliveryType === "manual"
                                )
                                .reduce(
                                  (sum, item) => sum + item.quantity,
                                  0
                                )}{" "}
                              codes needed
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-4">
                          Please enter the exact number of codes required (one
                          code per line).
                        </p>
                        <div className="space-y-3">
                          <textarea
                            value={codesInput}
                            onChange={(e) => setCodesInput(e.target.value)}
                            placeholder="Example:&#10;ABCD-1234-EFGH-5678&#10;IJKL-9012-MNOP-3456&#10;QRST-7890-UVWX-1234"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-[#1c75bc] focus:border-transparent resize-none"
                            rows="6"
                          />
                          <div className="flex items-start gap-2 text-xs text-gray-600">
                            <svg
                              className="w-4 h-4 text-[#1c75bc] mt-0.5 shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div>
                              <p className="font-semibold mb-1">
                                Instructions:
                              </p>
                              <ul className="list-disc list-inside space-y-1">
                                <li>Enter one code per line</li>
                                <li>
                                  Provide exactly{" "}
                                  {selectedOrder.orderItems
                                    .filter(
                                      (item) =>
                                        item.product.deliveryType === "manual"
                                    )
                                    .reduce(
                                      (sum, item) => sum + item.quantity,
                                      0
                                    )}{" "}
                                  codes
                                </li>
                                <li>
                                  Codes will be delivered to customer
                                  immediately
                                </li>
                                <li>
                                  Order status will change to "CODE_DELIVERED"
                                </li>
                              </ul>
                            </div>
                          </div>
                          <button
                            onClick={() => uploadManualCodes(selectedOrder.id)}
                            disabled={uploadingCodes || !codesInput.trim()}
                            className="w-full bg-[#1c75bc] text-white px-6 py-3 rounded-lg hover:bg-[#1557a0] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {uploadingCodes ? (
                              <>
                                <svg
                                  className="animate-spin h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Uploading Codes...
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                  />
                                </svg>
                                Upload & Deliver Codes
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Quick Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  {selectedOrder.status === "PAYMENT_SUBMITTED" && (
                    <>
                      <button
                        onClick={() =>
                          updateStatus(selectedOrder.id, "PAYMENT_VERIFIED")
                        }
                        className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={18} />
                        Verify Payment
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt("Rejection reason:");
                          if (reason)
                            updateStatus(
                              selectedOrder.id,
                              "PAYMENT_REJECTED",
                              reason
                            );
                        }}
                        className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
                      >
                        <XCircle size={18} />
                        Reject Payment
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
