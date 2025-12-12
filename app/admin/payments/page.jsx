"use client";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Filter,
  Download,
  AlertCircle,
} from "lucide-react";

export default function AdminPayments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PAYMENT_SUBMITTED");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await fetch(`/api/admin/orders?${params}`);
      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders || []);
      } else {
        console.error("Failed to fetch orders:", data.error);
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrder = (orderId) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map((order) => order.id)));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedOrders.size === 0) {
      alert("Please select at least one order");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to approve ${selectedOrders.size} order(s)?`
      )
    ) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch("/api/admin/orders/bulk-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: Array.from(selectedOrders),
          action: "approve",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Successfully approved ${data.count} order(s)`);
        setSelectedOrders(new Set());
        fetchOrders();
      } else {
        alert(data.error || "Failed to approve orders");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to approve orders");
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedOrders.size === 0) {
      alert("Please select at least one order");
      return;
    }

    const reason = prompt("Enter rejection reason (will be sent to customer):");
    if (!reason) return;

    setProcessing(true);
    try {
      const response = await fetch("/api/admin/orders/bulk-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: Array.from(selectedOrders),
          action: "reject",
          reason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Successfully rejected ${data.count} order(s)`);
        setSelectedOrders(new Set());
        fetchOrders();
      } else {
        alert(data.error || "Failed to reject orders");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to reject orders");
    } finally {
      setProcessing(false);
    }
  };

  const handleSingleApprove = async (orderId) => {
    if (!confirm("Are you sure you want to approve this payment?")) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Payment approved successfully");
        fetchOrders();
      } else {
        alert(data.error || "Failed to approve payment");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to approve payment");
    } finally {
      setProcessing(false);
    }
  };

  const handleSingleReject = async (orderId) => {
    const reason = prompt("Enter rejection reason (will be sent to customer):");
    if (!reason) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Payment rejected");
        fetchOrders();
      } else {
        alert(data.error || "Failed to reject payment");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to reject payment");
    } finally {
      setProcessing(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.paymentReference?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const badges = {
      PAYMENT_SUBMITTED: {
        icon: Clock,
        class: "bg-yellow-100 text-yellow-700",
        text: "Pending Verification",
      },
      PROCESSING: {
        icon: Clock,
        class: "bg-blue-100 text-blue-700",
        text: "Processing",
      },
      DELIVERED: {
        icon: CheckCircle,
        class: "bg-green-100 text-green-700",
        text: "Completed",
      },
      CANCELLED: {
        icon: XCircle,
        class: "bg-red-100 text-red-700",
        text: "Cancelled",
      },
    };

    const badge = badges[status] || badges.PAYMENT_SUBMITTED;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.class}`}
      >
        <Icon size={12} />
        {badge.text}
      </span>
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="text-slate-500">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl">
          Payment{" "}
          <span className="text-slate-800 font-medium">Verification</span>
        </h1>
        {selectedOrders.size > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">
              {selectedOrders.size} selected
            </span>
            <button
              onClick={handleBulkApprove}
              disabled={processing}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
            >
              <CheckCircle size={16} />
              Approve Selected
            </button>
            <button
              onClick={handleBulkReject}
              disabled={processing}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
            >
              <XCircle size={16} />
              Reject Selected
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by Order ID, Email, or Reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="relative">
          <Filter
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
          >
            <option value="all">All Orders</option>
            <option value="PAYMENT_SUBMITTED">Pending Verification</option>
            <option value="PROCESSING">Processing</option>
            <option value="DELIVERED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 mb-1">
                Pending Verification
              </p>
              <p className="text-2xl font-bold text-yellow-700">
                {orders.filter((o) => o.status === "PAYMENT_SUBMITTED").length}
              </p>
            </div>
            <Clock size={32} className="text-yellow-400" />
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 mb-1">Processing</p>
              <p className="text-2xl font-bold text-blue-700">
                {orders.filter((o) => o.status === "PROCESSING").length}
              </p>
            </div>
            <Clock size={32} className="text-blue-400" />
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-700">
                {orders.filter((o) => o.status === "DELIVERED").length}
              </p>
            </div>
            <CheckCircle size={32} className="text-green-400" />
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-700">
                ₨{orders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2)}
              </p>
            </div>
            <Download size={32} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length > 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedOrders.size === filteredOrders.length &&
                        filteredOrders.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-slate-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Payment Method
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedOrders.has(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                        className="rounded border-slate-300"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-600">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium text-slate-800">
                          {order.user?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {order.user?.email || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                      ₨{order.total}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 capitalize">
                      {order.paymentMethod?.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {order.paymentReference || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {order.paymentProof && (
                          <a
                            href={order.paymentProof}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-slate-100 rounded-lg transition"
                            title="View Payment Proof"
                          >
                            <Eye size={16} className="text-slate-600" />
                          </a>
                        )}
                        {order.status === "PAYMENT_SUBMITTED" && (
                          <>
                            <button
                              onClick={() => handleSingleApprove(order.id)}
                              disabled={processing}
                              className="p-2 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle
                                size={16}
                                className="text-green-600"
                              />
                            </button>
                            <button
                              onClick={() => handleSingleReject(order.id)}
                              disabled={processing}
                              className="p-2 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle size={16} className="text-red-600" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <AlertCircle size={48} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">
            No orders found
          </h3>
          <p className="text-slate-500">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "No orders to display"}
          </p>
        </div>
      )}
    </div>
  );
}
