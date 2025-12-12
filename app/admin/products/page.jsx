"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react";
import Link from "next/link";
import Loading from "@/components/Loading";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    region: "all",
    deliveryType: "all",
    inStock: "all",
  });

  useEffect(() => {
    fetchCategories();
    fetchRegions();
    fetchProducts();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchRegions = async () => {
    try {
      const response = await fetch("/api/admin/regions");
      const data = await response.json();
      if (data.regions) {
        setRegions(data.regions);
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category !== "all")
        params.append("category", filters.category);
      if (filters.region !== "all") params.append("region", filters.region);
      if (filters.deliveryType !== "all")
        params.append("deliveryType", filters.deliveryType);
      if (filters.inStock !== "all") params.append("inStock", filters.inStock);

      const response = await fetch(`/api/admin/products?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("Product deleted!");
        fetchProducts();
      } else {
        alert(data.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  const toggleStock = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inStock: !currentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="text-slate-700">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-medium">
            Product <span className="text-slate-500">Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {filteredProducts.length} products
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Region Filter */}
          <select
            value={filters.region}
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Regions</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.flag} {region.name}
              </option>
            ))}
          </select>

          {/* Delivery Type Filter */}
          <select
            value={filters.deliveryType}
            onChange={(e) =>
              setFilters({ ...filters, deliveryType: e.target.value })
            }
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Delivery Types</option>
            <option value="instant">Instant</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Region
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Delivery
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Codes
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.images && product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-slate-800 text-sm">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-500">{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-600">
                      {product.categoryRelation?.emoji}{" "}
                      {product.categoryRelation?.name || product.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-600">
                      {product.regionRelation?.flag}{" "}
                      {product.regionRelation?.code || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <p className="font-medium text-slate-800">
                        ₨{product.price}
                      </p>
                      {product.mrp > product.price && (
                        <p className="text-xs text-slate-400 line-through">
                          ₨{product.mrp}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.deliveryType === "instant"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {product.deliveryType === "instant"
                        ? "⚡ Instant"
                        : "📦 Manual"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-600">
                      {product.availableCodes} codes
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStock(product.id, product.inStock)}
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.inStock
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-indigo-600 hover:text-indigo-800 transition"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="text-red-600 hover:text-red-800 transition"
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p className="text-lg">No products found</p>
            <p className="text-sm mt-2">
              {searchTerm
                ? "Try adjusting your search or filters"
                : "Click 'Add Product' to create one"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
