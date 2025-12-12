"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Eye,
  MessageCircle,
} from "lucide-react";
import DisputeChat from "@/components/DisputeChat";

export default function DisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [stats, setStats] = useState({
    open: 0,
    underReview: 0,
    resolved: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [showChat, setShowChat] = useState(null);

  useEffect(() => {
    fetchDisputes();
  }, [filter]);

  const fetchDisputes = async () => {
    try {
      const res = await fetch(`/api/admin/disputes?status=${filter}`);
      const data = await res.json();

      if (data.success) {
        setDisputes(data.disputes);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching disputes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (
    disputeId,
    status,
    adminResponse,
    resolution,
    refundAmount = null,
    refundIssued = false
  ) => {
    setResolving(true);
    try {
      const res = await fetch(`/api/admin/disputes/${disputeId}/resolve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          adminResponse,
          resolution,
          refundAmount,
          refundIssued,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Dispute updated successfully");
        setSelectedDispute(null);
        fetchDisputes();
      } else {
        alert(data.error || "Failed to update dispute");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to update dispute");
    } finally {
      setResolving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-red-100 text-red-800";
      case "UNDER_REVIEW":
        return "bg-yellow-100 text-yellow-800";
      case "AWAITING_RESPONSE":
        return "bg-blue-100 text-blue-800";
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "CLOSED":
        return "bg-slate-100 text-slate-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getReasonLabel = (reason) => {
    const labels = {
      CODE_NOT_WORKING: "Code Not Working",
      WRONG_CODE_RECEIVED: "Wrong Code Received",
      INCOMPLETE_DELIVERY: "Incomplete Delivery",
      PAYMENT_ISSUES: "Payment Issues",
      REFUND_REQUEST: "Refund Request",
      OTHER: "Other",
    };
    return labels[reason] || reason;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Dispute Management
        </h1>
        <p className="text-slate-600 mt-1">
          Review and resolve customer disputes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Open</p>
              <p className="text-2xl font-bold text-red-800">{stats.open}</p>
            </div>
            <AlertCircle className="text-red-600" size={32} />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">
                Under Review
              </p>
              <p className="text-2xl font-bold text-yellow-800">
                {stats.underReview}
              </p>
            </div>
            <Clock className="text-yellow-600" size={32} />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Resolved</p>
              <p className="text-2xl font-bold text-green-800">
                {stats.resolved}
              </p>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Total</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <MessageSquare className="text-slate-600" size={32} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {[
            "all",
            "OPEN",
            "UNDER_REVIEW",
            "AWAITING_RESPONSE",
            "RESOLVED",
            "CLOSED",
          ].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? "bg-green-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {status === "all" ? "All" : status.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Disputes Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Dispute ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Reason
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {disputes.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No disputes found
                  </td>
                </tr>
              ) : (
                disputes.map((dispute) => (
                  <tr key={dispute.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-mono text-slate-600">
                      {dispute.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="font-medium text-slate-800">
                          {dispute.user.name}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {dispute.user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="font-mono text-slate-600">
                          {dispute.order.id.slice(0, 8)}...
                        </p>
                        <p className="text-slate-500">₨{dispute.order.total}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {getReasonLabel(dispute.reason)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          dispute.status
                        )}`}
                      >
                        {dispute.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(dispute.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedDispute(dispute)}
                          className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1"
                        >
                          <Eye size={16} />
                          View
                        </button>
                        <button
                          onClick={() => setShowChat(dispute)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                        >
                          <MessageCircle size={16} />
                          Chat
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispute Detail Modal */}
      {selectedDispute && (
        <DisputeModal
          dispute={selectedDispute}
          onClose={() => setSelectedDispute(null)}
          onResolve={handleResolve}
          resolving={resolving}
          getReasonLabel={getReasonLabel}
          getStatusColor={getStatusColor}
          onOpenChat={() => {
            setShowChat(selectedDispute);
            setSelectedDispute(null);
          }}
        />
      )}

      {/* Dispute Chat Modal */}
      {showChat && (
        <DisputeChat
          disputeId={showChat.id}
          orderId={showChat.orderId}
          isAdmin={true}
          onClose={() => {
            setShowChat(null);
            fetchDisputes(); // Refresh disputes after chat
          }}
        />
      )}
    </div>
  );
}

function DisputeModal({
  dispute,
  onClose,
  onResolve,
  resolving,
  getReasonLabel,
  getStatusColor,
  onOpenChat,
}) {
  const [status, setStatus] = useState(dispute.status);
  const [adminResponse, setAdminResponse] = useState(
    dispute.adminResponse || ""
  );
  const [resolution, setResolution] = useState(dispute.resolution || "");
  const [processingRefund, setProcessingRefund] = useState(false);

  const handleSubmit = () => {
    if (!adminResponse.trim()) {
      alert("Please provide an admin response");
      return;
    }

    onResolve(dispute.id, status, adminResponse, resolution);
  };

  const handleIssueRefund = async (refundType) => {
    if (!resolution.trim()) {
      alert("Please provide a resolution description");
      return;
    }

    const amount =
      refundType === "FULL" ? dispute.order.total : dispute.order.total / 2;

    const confirmMsg = `Process ${
      refundType === "FULL" ? "FULL" : "HALF"
    } refund of ₨${amount.toFixed(
      2
    )} to customer's wallet?\n\nThis will:\n1. Credit ${
      refundType === "FULL" ? "100%" : "50%"
    } of order total to wallet\n2. Update dispute status to RESOLVED\n3. ${
      refundType === "FULL"
        ? "Allow admin to close dispute"
        : "Allow customer to close dispute"
    }`;

    if (!confirm(confirmMsg)) return;

    setProcessingRefund(true);
    try {
      const response = await fetch(`/api/disputes/${dispute.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refundType, // "HALF" or "FULL"
          resolution: resolution.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process refund");
      }

      alert(
        `Refund processed successfully!\n\nAmount: ₨${amount.toFixed(
          2
        )}\nType: ${refundType}\nStatus: ${data.dispute.status}`
      );
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error processing refund:", error);
      alert(error.message || "Failed to process refund");
    } finally {
      setProcessingRefund(false);
    }
  };

  const handleCloseDispute = async () => {
    if (
      !confirm(
        "Are you sure you want to close this dispute?\n\nThis action cannot be undone."
      )
    ) {
      return;
    }

    setResolving(true);
    try {
      const response = await fetch(`/api/disputes/${dispute.id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to close dispute");
      }

      alert("Dispute closed successfully!");
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error closing dispute:", error);
      alert(error.message || "Failed to close dispute");
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Dispute Details
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              ID: {dispute.id.slice(0, 12)}...
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onOpenChat}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <MessageCircle size={16} />
              Open Chat
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-800 mb-2">
              Customer Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-600">Name</p>
                <p className="font-medium text-slate-800">
                  {dispute.user.name}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Email</p>
                <p className="font-medium text-slate-800">
                  {dispute.user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-800 mb-2">
              Order Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <p className="text-slate-600">Order ID</p>
                <p className="font-mono text-slate-800">{dispute.order.id}</p>
              </div>
              <div>
                <p className="text-slate-600">Total Amount</p>
                <p className="font-semibold text-slate-800">
                  ₨{dispute.order.total}
                </p>
              </div>
            </div>
            <div>
              <p className="text-slate-600 text-sm mb-2">Products</p>
              <div className="space-y-2">
                {dispute.order.orderItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3 bg-white rounded p-2"
                  >
                    {item.product.images && item.product.images[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-800">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dispute Details */}
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">
              Dispute Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600">Reason</p>
                <p className="font-medium text-slate-800">
                  {getReasonLabel(dispute.reason)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Description</p>
                <p className="text-slate-800 bg-slate-50 p-3 rounded">
                  {dispute.description}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Status</p>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    dispute.status
                  )}`}
                >
                  {dispute.status.replace(/_/g, " ")}
                </span>
              </div>
              {dispute.images && dispute.images.length > 0 && (
                <div>
                  <p className="text-sm text-slate-600 mb-2">Evidence Images</p>
                  <div className="grid grid-cols-3 gap-2">
                    {dispute.images.map((img, idx) => (
                      <a
                        key={idx}
                        href={img}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={img}
                          alt={`Evidence ${idx + 1}`}
                          className="w-full h-32 object-cover rounded border"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Admin Response Section */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-semibold text-slate-800 mb-4">
              Admin Response
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="OPEN">Open</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="AWAITING_RESPONSE">Awaiting Response</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Response Message *
                </label>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  rows="4"
                  placeholder="Your response to the customer..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Resolution Details
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows="3"
                  placeholder="How the dispute was resolved..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1c75bc] focus:border-transparent"
                />
              </div>

              {/* Refund Status Display */}
              {dispute.refundIssued && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <DollarSign size={16} />
                    Refund Already Issued
                  </h4>
                  <p className="text-sm text-green-800">
                    Amount: <strong>₨{dispute.refundAmount?.toFixed(2)}</strong>
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Issued on:{" "}
                    {new Date(dispute.refundedAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Refund Action Buttons - Only show if no refund issued yet */}
              {!dispute.refundIssued && dispute.status !== "CLOSED" && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <DollarSign size={16} />
                    Issue Refund to Customer
                  </h4>
                  <p className="text-sm text-slate-600 mb-4">
                    Order Total:{" "}
                    <strong>₨{dispute.order.total.toFixed(2)}</strong>
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleIssueRefund("HALF")}
                      disabled={processingRefund || !resolution.trim()}
                      className="bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {processingRefund ? (
                        <>
                          <Clock size={16} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <DollarSign size={16} />
                          Half Refund (50%)
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleIssueRefund("FULL")}
                      disabled={processingRefund || !resolution.trim()}
                      className="bg-[#1c75bc] text-white px-4 py-3 rounded-lg hover:bg-[#1557a0] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {processingRefund ? (
                        <>
                          <Clock size={16} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <DollarSign size={16} />
                          Full Refund (100%)
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <p className="text-slate-600">
                      • <strong>Half Refund:</strong> Credits ₨
                      {(dispute.order.total / 2).toFixed(2)} - Customer can
                      close dispute
                    </p>
                    <p className="text-slate-600">
                      • <strong>Full Refund:</strong> Credits ₨
                      {dispute.order.total.toFixed(2)} - Admin can close dispute
                    </p>
                  </div>

                  {!resolution.trim() && (
                    <p className="text-xs text-red-600 mt-3">
                      ⚠️ Resolution details are required before issuing refund
                    </p>
                  )}
                </div>
              )}

              {/* Close Dispute Button - Only show if admin can close */}
              {dispute.canAdminClose && dispute.status !== "CLOSED" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">
                    Close Dispute
                  </h4>
                  <p className="text-sm text-green-800 mb-3">
                    Full refund has been issued. You can now close this dispute.
                  </p>
                  <button
                    onClick={handleCloseDispute}
                    disabled={resolving}
                    className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resolving ? "Closing..." : "Close Dispute"}
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={resolving}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resolving ? "Updating..." : "Update Dispute"}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
