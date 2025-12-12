"use client";
import Loading from "@/components/Loading";
import {
  CircleDollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Users,
  Activity,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "Rs";

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    products: 0,
    revenue: 0,
    orders: 0,
    users: 0,
    todayOrders: 0,
    todayRevenue: 0,
    monthOrders: 0,
    monthRevenue: 0,
    pendingVerification: 0,
    processingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    completionRate: 0,
    recentOrders: [],
  });

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/dashboard");
      const data = await response.json();

      if (response.ok && data.success) {
        const dashboard = data.dashboard;
        setDashboardData({
          products: dashboard.platform.totalProducts,
          revenue: dashboard.revenue.total,
          orders: dashboard.orders.total,
          users: dashboard.platform.totalUsers,
          todayOrders: dashboard.today.orders,
          todayRevenue: dashboard.today.revenue,
          monthOrders: dashboard.thisMonth.orders,
          monthRevenue: dashboard.thisMonth.revenue,
          pendingVerification: dashboard.orders.pendingVerification,
          processingOrders: dashboard.orders.processing,
          completedOrders: dashboard.orders.completed,
          cancelledOrders: dashboard.orders.cancelled,
          completionRate: dashboard.orders.completionRate,
          recentOrders: dashboard.recentActivity.orders || [],
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#16112c]">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Alert for Pending Verifications */}
      {dashboardData.pendingVerification > 0 && (
        <Link href="/admin/approve">
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:bg-amber-100 transition shadow-sm">
            <AlertCircle size={24} className="text-amber-600 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-amber-900">
                {dashboardData.pendingVerification} Payment
                {dashboardData.pendingVerification > 1 ? "s" : ""} Awaiting
                Verification
              </p>
              <p className="text-sm text-amber-700">
                Click to review and approve/reject pending payments
              </p>
            </div>
            <Clock size={20} className="text-amber-600 shrink-0" />
          </div>
        </Link>
      )}

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue Card */}
        <div className="bg-linear-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">
                Total Revenue
              </p>
              <h3 className="text-3xl font-bold mb-2">
                {currency}
                {dashboardData.revenue.toLocaleString()}
              </h3>
              <div className="flex items-center gap-2 text-green-100 text-xs">
                <TrendingUp size={14} />
                <span>All time earnings</span>
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <CircleDollarSign size={24} />
            </div>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">
                Total Orders
              </p>
              <h3 className="text-3xl font-bold mb-2">
                {dashboardData.orders.toLocaleString()}
              </h3>
              <div className="flex items-center gap-2 text-blue-100 text-xs">
                <CheckCircle size={14} />
                <span>{dashboardData.completionRate}% completion rate</span>
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <ShoppingCart size={24} />
            </div>
          </div>
        </div>

        {/* Total Products Card */}
        <div className="bg-linear-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">
                Total Products
              </p>
              <h3 className="text-3xl font-bold mb-2">
                {dashboardData.products}
              </h3>
              <div className="flex items-center gap-2 text-purple-100 text-xs">
                <Package size={14} />
                <span>Active listings</span>
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <Package size={24} />
            </div>
          </div>
        </div>

        {/* Total Users Card */}
        <div className="bg-linear-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">
                Total Users
              </p>
              <h3 className="text-3xl font-bold mb-2">{dashboardData.users}</h3>
              <div className="flex items-center gap-2 text-orange-100 text-xs">
                <Users size={14} />
                <span>Registered customers</span>
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <Users size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Today & This Month Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-[#1c75bc]" size={20} />
            <h3 className="text-lg font-semibold text-[#16112c]">
              Today's Performance
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Orders</p>
              <p className="text-2xl font-bold text-[#1c75bc]">
                {dashboardData.todayOrders}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                {currency}
                {dashboardData.todayRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* This Month's Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-[#1c75bc]" size={20} />
            <h3 className="text-lg font-semibold text-[#16112c]">
              This Month's Performance
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Orders</p>
              <p className="text-2xl font-bold text-[#1c75bc]">
                {dashboardData.monthOrders}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                {currency}
                {dashboardData.monthRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#16112c] mb-6">
          Order Status Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} className="text-amber-600" />
              <p className="text-sm font-medium text-amber-900">Pending</p>
            </div>
            <p className="text-2xl font-bold text-amber-600">
              {dashboardData.pendingVerification}
            </p>
          </div>

          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={18} className="text-blue-600" />
              <p className="text-sm font-medium text-blue-900">Processing</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {dashboardData.processingOrders}
            </p>
          </div>

          <div className="border border-green-200 bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={18} className="text-green-600" />
              <p className="text-sm font-medium text-green-900">Completed</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {dashboardData.completedOrders}
            </p>
          </div>

          <div className="border border-red-200 bg-red-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle size={18} className="text-red-600" />
              <p className="text-sm font-medium text-red-900">Cancelled</p>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {dashboardData.cancelledOrders}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-[#16112c]">
            Recent Orders
          </h3>
          <Link
            href="/admin/orders"
            className="text-sm text-[#1c75bc] hover:underline font-medium"
          >
            View All →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Order ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Customer
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.recentOrders.length > 0 ? (
                dashboardData.recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-mono text-gray-900">
                      #{order.id.substring(0, 8)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {order.user.name}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                      {currency}
                      {order.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : order.status === "PAYMENT_SUBMITTED"
                            ? "bg-amber-100 text-amber-800"
                            : order.status === "PROCESSING"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
