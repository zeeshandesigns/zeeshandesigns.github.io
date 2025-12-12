"use client";
import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import Loading from "@/components/Loading";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    slug: "",
    name: "",
    emoji: "",
    logo: "",
    description: "",
    gradient: "from-blue-500 to-indigo-600",
    order: 0,
    isActive: true,
  });

  const gradientOptions = [
    "from-blue-500 to-indigo-600",
    "from-green-500 to-emerald-600",
    "from-red-500 to-pink-600",
    "from-orange-500 to-yellow-600",
    "from-purple-500 to-pink-600",
    "from-slate-600 to-slate-800",
    "from-cyan-500 to-blue-600",
    "from-pink-500 to-rose-600",
    "from-indigo-500 to-purple-600",
    "from-green-600 to-lime-600",
    "from-yellow-500 to-orange-600",
    "from-red-600 to-black",
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "pak-cards/categories");

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({ ...prev, logo: data.url }));
        alert("Logo uploaded successfully!");
      } else {
        alert(data.error || "Failed to upload logo");
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : "/api/admin/categories";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert(editingId ? "Category updated!" : "Category created!");
        resetForm();
        fetchCategories();
      } else {
        alert(data.error || "Failed to save category");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category");
    }
  };

  const handleEdit = (category) => {
    setFormData({
      slug: category.slug,
      name: category.name,
      emoji: category.emoji,
      logo: category.logo || "",
      description: category.description,
      gradient: category.gradient,
      order: category.order,
      isActive: category.isActive,
    });
    setEditingId(category.id);
    setIsAdding(true);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("Category deleted!");
        fetchCategories();
      } else {
        alert(data.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    }
  };

  const resetForm = () => {
    setFormData({
      slug: "",
      name: "",
      emoji: "",
      logo: "",
      description: "",
      gradient: "from-blue-500 to-indigo-600",
      order: 0,
      isActive: true,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  if (loading) return <Loading />;

  return (
    <div className="text-slate-700">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-medium">
            Category <span className="text-slate-500">Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage gift card categories
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? "Cancel" : "Add Category"}
        </button>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6"
        >
          <h2 className="text-lg font-medium mb-4">
            {editingId ? "Edit Category" : "Add New Category"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., playstation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., PlayStation"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category Logo * (Primary Display)
              </label>
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Upload image (max 5MB). This will be the primary display for
                    the category.
                  </p>
                </div>
                {formData.logo && (
                  <div className="w-20 h-20 border-2 border-slate-300 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center">
                    <img
                      src={formData.logo}
                      alt="Logo preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
                {uploading && (
                  <div className="w-20 h-20 border-2 border-indigo-300 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Emoji (Fallback)
              </label>
              <input
                type="text"
                value={formData.emoji}
                onChange={(e) =>
                  setFormData({ ...formData, emoji: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="🎮"
              />
              <p className="text-xs text-slate-500 mt-1">
                Used only if logo is not uploaded
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Gradient
              </label>
              <select
                value={formData.gradient}
                onChange={(e) =>
                  setFormData({ ...formData, gradient: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {gradientOptions.map((gradient) => (
                  <option key={gradient} value={gradient}>
                    {gradient}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-slate-700">Active</span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="2"
                placeholder="e.g., PSN Gift Cards"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
            >
              <Save size={18} />
              {editingId ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {category.logo ? (
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <img
                      src={category.logo}
                      alt={category.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <span className="text-3xl">{category.emoji}</span>
                )}
                <div>
                  <h3 className="font-medium text-slate-800">
                    {category.name}
                  </h3>
                  <p className="text-xs text-slate-500">{category.slug}</p>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  category.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {category.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <p className="text-sm text-slate-600 mb-3">
              {category.description}
            </p>

            <div
              className={`h-2 rounded-full bg-linear-to-r ${category.gradient} mb-3`}
            />

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{category._count.products} products</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="text-indigo-600 hover:text-indigo-800 transition"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(category.id, category.name)}
                  className="text-red-600 hover:text-red-800 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && !isAdding && (
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg">No categories yet</p>
          <p className="text-sm mt-2">Click "Add Category" to create one</p>
        </div>
      )}
    </div>
  );
}
