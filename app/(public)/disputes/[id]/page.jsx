"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Calendar,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Loading from "@/components/Loading";
import DisputeChat from "@/components/DisputeChat";

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchDispute();
    }
  }, [params.id]);

  const fetchDispute = async () => {
    try {
      const res = await fetch(`/api/disputes/${params.id}`);
      const data = await res.json();

      if (res.ok) {
        setDispute(data.dispute);
      } else {
        alert("Dispute not found");
        router.push("/disputes");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to load dispute");
    } finally {
      setLoading(false);
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

    setClosing(true);
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
      router.push("/disputes");
    } catch (error) {
      console.error("Error closing dispute:", error);
      alert(error.message || "Failed to close dispute");
    } finally {
      setClosing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "RESOLVED":
        return "bg-green-100 text-green-700 border-green-200";
      case "CLOSED":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) return <Loading />;
  if (!dispute) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => router.push("/disputes")}
          className="flex items-center gap-2 text-[#1c75bc] hover:text-[#1557a0] font-medium mb-6 transition"
        >
          <ArrowLeft size={20} />
          Back to Disputes
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#16112c] mb-2">
                Dispute #{dispute.id.substring(0, 8).toUpperCase()}
              </h1>
              <p className="text-gray-600">
                Order: #{dispute.orderId.substring(0, 8).toUpperCase()}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                dispute.status
              )}`}
            >
              {dispute.status.replace(/_/g, " ")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-[#1c75bc] mt-1" size={20} />
              <div>
                <p className="text-sm font-semibold text-gray-700">Reason</p>
                <p className="text-gray-600 capitalize">
                  {dispute.reason.replace(/_/g, " ")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="text-[#1c75bc] mt-1" size={20} />
              <div>
                <p className="text-sm font-semibold text-gray-700">Created</p>
                <p className="text-gray-600">
                  {new Date(dispute.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {dispute.description && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Description
              </p>
              <p className="text-gray-700">{dispute.description}</p>
            </div>
          )}

          {/* Refund Information */}
          {dispute.refundIssued && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200 mb-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-600 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-900 mb-1">
                    Refund Issued
                  </p>
                  <p className="text-green-800">
                    Amount: <strong>₨{dispute.refundAmount?.toFixed(2)}</strong>
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    The refund has been credited to your wallet.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Close Dispute Button - Only show if user can close */}
          {!dispute.canAdminClose &&
            dispute.status === "RESOLVED" &&
            dispute.status !== "CLOSED" && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-900 mb-3">
                  The dispute has been resolved. You can now close this dispute
                  to mark it as complete.
                </p>
                <button
                  onClick={handleCloseDispute}
                  disabled={closing}
                  className="w-full bg-[#1c75bc] text-white px-4 py-3 rounded-lg hover:bg-[#1557a0] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {closing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Closing...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Close Dispute
                    </>
                  )}
                </button>
              </div>
            )}
        </div>

        {/* Dispute Chat */}
        <DisputeChat disputeId={dispute.id} orderId={dispute.orderId} />
      </div>
    </div>
  );
}
