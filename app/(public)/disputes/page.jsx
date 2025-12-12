"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Search,
  Package,
} from "lucide-react";
import Loading from "@/components/Loading";
import PageTitle from "@/components/PageTitle";

export default function DisputesPage() {
  const router = useRouter();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchDisputes();
  }, [statusFilter]);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await fetch(`/api/disputes/user?${params}`);
      const data = await res.json();

      if (res.ok) {
        setDisputes(data.disputes || []);
      } else {
        console.error("Failed to fetch disputes");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDisputes = disputes.filter((dispute) => {
    const matchesSearch =
      dispute.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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

  const getStatusIcon = (status) => {
    switch (status) {
      case "OPEN":
        return <AlertTriangle className="text-yellow-600" size={18} />;
      case "IN_PROGRESS":
        return <Clock className="text-blue-600 animate-pulse" size={18} />;
      case "RESOLVED":
        return <CheckCircle className="text-green-600" size={18} />;
      case "CLOSED":
        return <XCircle className="text-gray-600" size={18} />;
      default:
        return <MessageCircle className="text-gray-600" size={18} />;
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <PageTitle
        title="My Disputes"
        subtitle="Track and manage your order disputes"
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search disputes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c75bc] focus:border-transparent transition"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c75bc] focus:border-transparent transition"
            >
              <option value="all">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <button
              onClick={fetchDisputes}
              className="bg-[#1c75bc] text-white px-4 py-2.5 rounded-lg hover:bg-[#1557a0] transition font-medium flex items-center justify-center gap-2"
            >
              <Search size={18} />
              Search
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-6 bg-blue-50 border-l-4 border-[#1c75bc] p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="text-[#1c75bc] mt-0.5 shrink-0"
              size={20}
            />
            <div className="text-sm">
              <p className="font-semibold text-[#16112c] mb-1">
                About Disputes:
              </p>
              <p className="text-gray-700">
                You can open a dispute within 24 hours of placing an order if
                you encounter any issues. Our team will review and respond as
                soon as possible.
              </p>
            </div>
          </div>
        </div>

        {/* Disputes List */}
        {filteredDisputes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#16112c] mb-2">
              No Disputes Found
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "You haven't opened any disputes yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDisputes.map((dispute) => (
              <div
                key={dispute.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(dispute.status)}
                    <div>
                      <h3 className="font-semibold text-[#16112c] text-lg">
                        Dispute #{dispute.id.substring(0, 8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Order: #{dispute.orderId.substring(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(
                      dispute.status
                    )}`}
                  >
                    {dispute.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Reason:
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    {dispute.reason.replace(/_/g, " ")}
                  </p>
                </div>

                {dispute.description && (
                  <div className="mb-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-sm text-gray-700">
                      {dispute.description}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Created {new Date(dispute.createdAt).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => router.push(`/disputes/${dispute.id}`)}
                    className="px-4 py-2 bg-[#1c75bc] text-white rounded-lg hover:bg-[#1557a0] transition font-medium flex items-center gap-2"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
