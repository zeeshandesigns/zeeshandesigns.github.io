"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Upload } from "lucide-react";
import Loading from "@/components/Loading";

export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;
  const isEditing = productId && productId !== "new";

  const [loading, setLoading] = useState(isEditing);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    mrp: "",
    price: "",
    images: "",
    logo: "",
    category: "gaming",
    categoryId: "",
    regionId: "",
    deliveryType: "instant",
    digitalCodes: "",
    requiresApproval: false,
    stockType: "unlimited",
    inStock: true,
  });

  useEffect(() => {
    fetchCategories();
    fetchRegions();
    if (isEditing) {
      fetchProduct();
    }
  }, []);

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

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`);
      const data = await response.json();

      if (data.success) {
        const product = data.product;
        setFormData({
          name: product.name,
          description: product.description,
          mrp: product.mrp,
          price: product.price,
          images: product.images.join("\n"),
          logo: product.logo || "",
          category: product.category,
          categoryId: product.categoryId || "",
          regionId: product.regionId || "",
          deliveryType: product.deliveryType,
          digitalCodes: Array.isArray(product.digitalCodes)
            ? product.digitalCodes.join("\n")
            : "",
          requiresApproval: product.requiresApproval,
          stockType: product.stockType,
          inStock: product.inStock,
        });
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      alert("Failed to fetch product");
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
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("folder", "pak-cards/products");

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: uploadFormData,
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
      // Prepare data
      const submitData = {
        ...formData,
        mrp: parseFloat(formData.mrp) || parseFloat(formData.price),
        price: parseFloat(formData.price),
        images: formData.images.split("\n").filter((url) => url.trim()),
      };

      const url = isEditing
        ? `/api/admin/products/${productId}`
        : "/api/admin/products";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        alert(isEditing ? "Product updated!" : "Product created!");
        router.push("/admin/products");
      } else {
        alert(data.error || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="text-slate-700">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft size={20} />
        <span>Back to Products</span>
      </button>

      <h1 className="text-2xl font-medium mb-6">
        {isEditing ? "Edit" : "Add"}{" "}
        <span className="text-slate-500">Product</span>
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-medium mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., PlayStation Network Card USA $10"
              />
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
                rows="3"
                placeholder="Product description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Region
              </label>
              <select
                value={formData.regionId}
                onChange={(e) =>
                  setFormData({ ...formData, regionId: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">No Region</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.flag} {region.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Legacy Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., gaming"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-medium mb-4">Pricing</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Price (₨) *
              </label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                MRP (₨)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.mrp}
                onChange={(e) =>
                  setFormData({ ...formData, mrp: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Leave blank to use price"
              />
            </div>
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-medium mb-4">Delivery Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Delivery Type *
              </label>
              <select
                value={formData.deliveryType}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryType: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="instant">⚡ Instant Delivery</option>
                <option value="manual">📦 Manual Delivery</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Stock Type
              </label>
              <select
                value={formData.stockType}
                onChange={(e) =>
                  setFormData({ ...formData, stockType: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="unlimited">Unlimited</option>
                <option value="limited">Limited</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Digital Codes (one per line)
              </label>
              <textarea
                value={formData.digitalCodes}
                onChange={(e) =>
                  setFormData({ ...formData, digitalCodes: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                rows="6"
                placeholder="PS-USA-10-XXXX&#10;PS-USA-10-YYYY&#10;PS-USA-10-ZZZZ"
              />
              <p className="text-xs text-slate-500 mt-1">
                {
                  formData.digitalCodes.split("\n").filter((c) => c.trim())
                    .length
                }{" "}
                codes
              </p>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requiresApproval}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requiresApproval: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-slate-700">
                  Requires Approval
                </span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.inStock}
                  onChange={(e) =>
                    setFormData({ ...formData, inStock: e.target.checked })
                  }
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-slate-700">In Stock</span>
              </label>
            </div>
          </div>
        </div>

        {/* Images & Logo */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-medium mb-4">Product Logo & Images</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Product Logo * (Primary Display)
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
                    Upload product logo (max 5MB). This will be the primary
                    display on product cards.
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
                Additional Image URLs (one per line, optional)
              </label>
              <textarea
                value={formData.images}
                onChange={(e) =>
                  setFormData({ ...formData, images: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                rows="4"
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              />
              <p className="text-xs text-slate-500 mt-1">
                Additional product images for the product detail page
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
          >
            <Save size={18} />
            {isEditing ? "Update Product" : "Create Product"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
