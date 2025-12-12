"use client";
import { useState, useEffect } from "react";
import {
  Wallet,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Clock,
} from "lucide-react";
import Image from "next/image";

export default function WalletTopUpsPage() {
  const [topUps, setTopUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [viewingProof, setViewingProof] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(null);

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "Rs";

  useEffect(() => {
    fetchTopUps();
  }, []);

  const fetchTopUps = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/wallet/topup/admin/pending");
      const data = await response.json();

      if (response.ok) {
        setTopUps(data.topUps);
      }
    } catch (error) {
      console.error("Failed to fetch top-ups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (topUpId) => {
    if (!confirm("Are you sure you want to verify this top-up?")) return;

    setProcessing(topUpId);
    try {
      const response = await fetch("/api/wallet/topup/admin/pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topUpId, action: "verify" }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Top-up verified successfully!");
        fetchTopUps();
      } else {
        alert(data.error || "Failed to verify top-up");
      }
    } catch (error) {
      alert("Failed to verify top-up");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (topUpId) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setProcessing(topUpId);
    try {
      const response = await fetch("/api/wallet/topup/admin/pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topUpId,
          action: "reject",
          rejectionReason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Top-up rejected");
        setShowRejectModal(null);
        setRejectionReason("");
        fetchTopUps();
      } else {
        alert(data.error || "Failed to reject top-up");
      }
    } catch (error) {
      alert("Failed to reject top-up");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Wallet className="text-green-600" size={32} />
          Wallet Top-Up Verification
        </h1>
        <p className="text-slate-600 mt-2">
          Review and verify pending wallet top-up requests
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-green-600" size={48} />
        </div>
      ) : topUps.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Clock className="mx-auto text-slate-300 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            No Pending Top-Ups
          </h3>
          <p className="text-slate-500">
            All top-up requests have been processed
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {topUps.map((topUp) => (
            <div
              key={topUp.id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Wallet className="text-green-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {topUp.user.name || topUp.user.email}
                      </h3>
                      <p className="text-sm text-slate-500">
                        User ID: {topUp.userId.substring(0, 12)}...
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Amount</p>
                      <p className="font-semibold text-green-600">
                        {currency} {topUp.amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Status</p>
                      <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                        {topUp.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Submitted</p>
                      <p className="text-sm text-slate-700">
                        {new Date(
                          topUp.submittedAt || topUp.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Reference</p>
                      <p className="text-sm text-slate-700">
                        {topUp.paymentReference || "N/A"}
                      </p>
                    </div>
                  </div>

                  {topUp.paymentProof && (
                    <button
                      onClick={() => setViewingProof(topUp.paymentProof)}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                      <Eye size={16} />
                      View Payment Proof
                    </button>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleVerify(topUp.id)}
                    disabled={processing === topUp.id}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                  >
                    {processing === topUp.id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Verify
                  </button>
                  <button
                    onClick={() => setShowRejectModal(topUp.id)}
                    disabled={processing === topUp.id}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Proof Modal */}
      {viewingProof && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingProof(null)}
        >
          <div className="bg-white rounded-xl max-w-3xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Payment Proof</h3>
              <button
                onClick={() => setViewingProof(null)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <Image
                src={viewingProof}
                alt="Payment Proof"
                width={800}
                height={600}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">
              Reject Top-Up
            </h3>
            <p className="text-slate-600 mb-4">
              Please provide a reason for rejecting this top-up request:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              rows="4"
              placeholder="e.g., Invalid payment proof, amount mismatch..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectionReason("");
                }}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                disabled={processing === showRejectModal}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing === showRejectModal ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  "Reject"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
