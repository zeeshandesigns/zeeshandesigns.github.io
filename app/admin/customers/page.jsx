"use client";
import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Shield,
  ShoppingBag,
  Star,
  MapPin,
  Eye,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import Loading from "@/components/Loading";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [adminFilter, setAdminFilter] = useState("all"); // all, admins, customers
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [adminFilter]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (adminFilter !== "all") params.append("adminFilter", adminFilter);

      const response = await fetch(`/api/admin/customers?${params}`);
      const data = await response.json();

      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      alert("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (customerId) => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedCustomer(data.customer);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
      alert("Failed to fetch customer details");
    }
  };

  const handleToggleAdmin = async (customerId, currentStatus) => {
    const action = currentStatus
      ? "remove admin access from"
      : "grant admin access to";
    const customer = customers.find((c) => c.id === customerId);

    if (!confirm(`Are you sure you want to ${action} ${customer.name}?`))
      return;

    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdmin: !currentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Admin status updated successfully!`);
        fetchCustomers();
        if (selectedCustomer?.id === customerId) {
          setShowModal(false);
        }
      } else {
        alert(data.error || "Failed to update admin status");
      }
    } catch (error) {
      console.error("Error updating admin status:", error);
      alert("Failed to update admin status");
    }
  };

  const handleDelete = async (customerId, name) => {
    if (
      !confirm(
        `Are you sure you want to delete ${name}? This cannot be undone.`
      )
    )
      return;

    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("Customer deleted successfully!");
        fetchCustomers();
        if (selectedCustomer?.id === customerId) {
          setShowModal(false);
        }
      } else {
        alert(data.error || "Failed to delete customer");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Failed to delete customer");
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="text-slate-700">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-medium">
            Customer <span className="text-slate-500">Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {filteredCustomers.length} customers
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search customers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Admin Filter */}
          <select
            value={adminFilter}
            onChange={(e) => setAdminFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Users</option>
            <option value="customers">Customers Only</option>
            <option value="admins">Admins Only</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Orders
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Reviews
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Addresses
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {customer.image ? (
                        <img
                          src={customer.image}
                          alt={customer.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <Users className="text-indigo-600" size={20} />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-800 text-sm">
                          {customer.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {customer.isAdmin ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                        <Shield size={12} />
                        Admin
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                        Customer
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                      <ShoppingBag size={14} />
                      {customer._count.buyerOrders}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                      <Star size={14} />
                      {customer._count.ratings}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                      <MapPin size={14} />
                      {customer._count.Address}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(customer.id)}
                        className="text-indigo-600 hover:text-indigo-800 transition"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() =>
                          handleToggleAdmin(customer.id, customer.isAdmin)
                        }
                        className={`${
                          customer.isAdmin
                            ? "text-orange-600 hover:text-orange-800"
                            : "text-green-600 hover:text-green-800"
                        } transition`}
                        title={customer.isAdmin ? "Remove Admin" : "Make Admin"}
                      >
                        {customer.isAdmin ? (
                          <UserX size={16} />
                        ) : (
                          <UserCheck size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id, customer.name)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-400" />
            <p className="text-lg">No customers found</p>
            <p className="text-sm mt-2">
              {searchTerm
                ? "Try adjusting your search or filters"
                : "Customers will appear here when they sign up"}
            </p>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {showModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-slate-800">
                Customer Details
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="flex items-start gap-4">
                {selectedCustomer.image ? (
                  <img
                    src={selectedCustomer.image}
                    alt={selectedCustomer.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Users className="text-indigo-600" size={32} />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {selectedCustomer.email}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    ID: {selectedCustomer.id}
                  </p>
                  <div className="mt-2">
                    {selectedCustomer.isAdmin ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                        <Shield size={12} />
                        Admin
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                        Customer
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <ShoppingBag
                    className="mx-auto mb-2 text-blue-600"
                    size={24}
                  />
                  <p className="text-2xl font-bold text-blue-700">
                    {selectedCustomer._count.buyerOrders}
                  </p>
                  <p className="text-xs text-blue-600">Total Orders</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <Star className="mx-auto mb-2 text-yellow-600" size={24} />
                  <p className="text-2xl font-bold text-yellow-700">
                    {selectedCustomer._count.ratings}
                  </p>
                  <p className="text-xs text-yellow-600">Reviews</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <MapPin className="mx-auto mb-2 text-green-600" size={24} />
                  <p className="text-2xl font-bold text-green-700">
                    {selectedCustomer._count.Address}
                  </p>
                  <p className="text-xs text-green-600">Addresses</p>
                </div>
              </div>

              {/* Recent Orders */}
              {selectedCustomer.buyerOrders &&
                selectedCustomer.buyerOrders.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-3">
                      Recent Orders
                    </h4>
                    <div className="space-y-2">
                      {selectedCustomer.buyerOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {order.id}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-800">
                              ₨{order.totalAmount}
                            </p>
                            <span className="text-xs px-2 py-1 rounded-full bg-white border border-slate-200">
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Addresses */}
              {selectedCustomer.Address &&
                selectedCustomer.Address.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-3">
                      Saved Addresses
                    </h4>
                    <div className="space-y-2">
                      {selectedCustomer.Address.map((address) => (
                        <div
                          key={address.id}
                          className="p-3 bg-slate-50 rounded-lg"
                        >
                          <p className="text-sm font-medium text-slate-800">
                            {address.street}
                          </p>
                          <p className="text-xs text-slate-600">
                            {address.city}, {address.state} {address.zip}
                          </p>
                          <p className="text-xs text-slate-500">
                            {address.country} • {address.phone}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Recent Reviews */}
              {selectedCustomer.ratings &&
                selectedCustomer.ratings.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-3">
                      Recent Reviews
                    </h4>
                    <div className="space-y-2">
                      {selectedCustomer.ratings.map((rating) => (
                        <div
                          key={rating.id}
                          className="p-3 bg-slate-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={
                                    i < rating.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-slate-300"
                                  }
                                />
                              ))}
                            </div>
                            <span className="text-xs text-slate-600">
                              {rating.product.name}
                            </span>
                          </div>
                          {rating.review && (
                            <p className="text-xs text-slate-600">
                              "{rating.review}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 flex gap-3">
              <button
                onClick={() =>
                  handleToggleAdmin(
                    selectedCustomer.id,
                    selectedCustomer.isAdmin
                  )
                }
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  selectedCustomer.isAdmin
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {selectedCustomer.isAdmin ? "Remove Admin" : "Make Admin"}
              </button>
              <button
                onClick={() =>
                  handleDelete(selectedCustomer.id, selectedCustomer.name)
                }
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
