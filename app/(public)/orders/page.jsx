"use client";
import PageTitle from "@/components/PageTitle";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { addMultipleToCart } from "@/lib/features/cart/cartSlice";
import OrderItem from "@/components/OrderItem";
import {
  Eye,
  Search,
  Filter,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Loader,
} from "lucide-react";
import Loading from "@/components/Loading";
import OrderDetailModal from "@/components/OrderDetailModal";

export default function Orders() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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

      const response = await fetch(`/api/orders/user?${params}`);
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

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (response.ok) {
        setSelectedOrder(data.order);
        setShowDetailModal(true);
      } else {
        alert("Failed to fetch order details");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to fetch order details");
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok) {
        alert("Order cancelled successfully");
        setShowDetailModal(false);
        fetchOrders(); // Refresh the orders list
      } else {
        alert(data.error || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to cancel order");
    }
  };

  const handleReorder = (orderItems) => {
    try {
      // Prepare items for cart
      const cartItems = orderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      // Add all items to cart
      dispatch(addMultipleToCart({ items: cartItems }));

      // Close modal
      setShowDetailModal(false);

      // Show success message
      const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      alert(
        `Successfully added ${itemCount} item${
          itemCount > 1 ? "s" : ""
        } to your cart!`
      );

      // Redirect to checkout
      router.push("/checkout");
    } catch (error) {
      console.error("Error reordering:", error);
      alert("Failed to add items to cart");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesSearch;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-green-500" size={16} />;
      case "processing":
        return <Loader className="text-blue-500 animate-spin" size={16} />;
      case "pending_verification":
        return <Clock className="text-yellow-500" size={16} />;
      case "cancelled":
        return <XCircle className="text-red-500" size={16} />;
      default:
        return <Package className="text-slate-500" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "pending_verification":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-[70vh] mx-6">
      <div className="my-20 max-w-7xl mx-auto">
        <PageTitle
          heading="My Orders"
          text={`Showing ${filteredOrders.length} order${
            filteredOrders.length !== 1 ? "s" : ""
          }`}
          linkText={"Go to home"}
        />

        {/* Filters */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by order ID or product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                size={18}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Orders</option>
                <option value="pending_verification">
                  Pending Verification
                </option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Order ID</p>
                      <p className="font-mono font-semibold text-slate-800">
                        #{order.orderNumber}
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm text-slate-500">Date</p>
                      <p className="text-slate-800">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      <span className="text-sm font-medium capitalize">
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <button
                      onClick={() => viewOrderDetails(order.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                    >
                      <Eye size={16} />
                      <span className="hidden sm:inline">View Details</span>
                    </button>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">
                          {item.productName}
                        </p>
                        <p className="text-sm text-slate-500">
                          Quantity: {item.quantity} × ₨{item.price}
                        </p>
                        {item.deliveryType === "instant" && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                            ⚡ Instant Delivery
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-800">
                          ₨{item.price * item.quantity}
                        </p>
                        {item.codesDelivered > 0 && (
                          <p className="text-xs text-green-600 mt-1">
                            {item.codesDelivered}/{item.quantity} codes
                            delivered
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                  <p className="text-slate-600">Total Amount</p>
                  <p className="text-xl font-bold text-slate-800">
                    ₨{order.totalPrice}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
            <Package size={64} className="text-slate-300 mb-4" />
            <h2 className="text-2xl font-semibold text-slate-600 mb-2">
              {searchTerm || statusFilter !== "all"
                ? "No orders found"
                : "You have no orders yet"}
            </h2>
            <p className="text-slate-500 mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Start shopping to see your orders here"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <a
                href="/"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
              >
                Browse Products
              </a>
            )}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedOrder(null);
          }}
          onCancelOrder={() => handleCancelOrder(selectedOrder.id)}
          onReorder={() => handleReorder(selectedOrder.items)}
        />
      )}
    </div>
  );
}
