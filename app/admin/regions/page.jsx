"use client";
import { useState, useEffect } from "react";
import { PlusIcon, PencilIcon, TrashIcon, GlobeIcon } from "lucide-react";
import Loading from "@/components/Loading";

export default function RegionsPage() {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    flag: "",
    currency: "",
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const res = await fetch("/api/admin/regions");
      const data = await res.json();
      if (res.ok) {
        setRegions(data.regions);
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingRegion
        ? `/api/admin/regions/${editingRegion.id}`
        : "/api/admin/regions";
      const method = editingRegion ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Region ${editingRegion ? "updated" : "created"} successfully!`);
        setShowForm(false);
        setEditingRegion(null);
        resetForm();
        fetchRegions();
      } else {
        alert(data.error || "Failed to save region");
      }
    } catch (error) {
      console.error("Error saving region:", error);
      alert("Failed to save region");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (region) => {
    setEditingRegion(region);
    setFormData({
      code: region.code,
      name: region.name,
      flag: region.flag,
      currency: region.currency,
      order: region.order,
      isActive: region.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id, name, productCount) => {
    if (productCount > 0) {
      alert(
        `Cannot delete ${name} because it has ${productCount} products. Please reassign products first.`
      );
      return;
    }

    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/regions/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Region deleted successfully!");
        fetchRegions();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete region");
      }
    } catch (error) {
      console.error("Error deleting region:", error);
      alert("Failed to delete region");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      flag: "",
      currency: "",
      order: 0,
      isActive: true,
    });
  };

  if (loading && regions.length === 0) {
    return <Loading />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Regions</h1>
          <p className="text-slate-600 mt-1">
            Manage geographic regions for gift cards
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingRegion(null);
            resetForm();
          }}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add Region
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-slate-200">
          <h2 className="text-xl font-semibold mb-4">
            {editingRegion ? "Edit Region" : "Add New Region"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Region Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="e.g., USA, UK, UAE"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Region Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., United States"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Flag Emoji *
                </label>
                <input
                  type="text"
                  required
                  value={formData.flag}
                  onChange={(e) =>
                    setFormData({ ...formData, flag: e.target.value })
                  }
                  placeholder="🇺🇸"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Currency Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  placeholder="USD, GBP, AED"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Active
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : editingRegion ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingRegion(null);
                  resetForm();
                }}
                className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Regions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {regions.map((region) => (
          <div
            key={region.id}
            className="bg-white rounded-lg shadow-md p-6 border border-slate-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{region.flag}</div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {region.name}
                  </h3>
                  <p className="text-sm text-slate-500">{region.code}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(region)}
                  className="p-1 hover:bg-slate-100 rounded"
                  title="Edit"
                >
                  <PencilIcon className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={() =>
                    handleDelete(region.id, region.name, region._count.products)
                  }
                  className="p-1 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Currency:</span>
                <span className="font-medium">{region.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Products:</span>
                <span className="font-medium">{region._count.products}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Status:</span>
                <span
                  className={`font-medium ${
                    region.isActive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {region.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {regions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <GlobeIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">
            No regions found. Add your first region!
          </p>
        </div>
      )}
    </div>
  );
}
