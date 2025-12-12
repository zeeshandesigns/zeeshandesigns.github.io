"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Upload, X } from "lucide-react";
import PageTitle from "@/components/PageTitle";

function DisputeCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState("CODE_NOT_WORKING");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();

      if (data.success || res.ok) {
        setOrder(data.order);

        // Check if order is eligible for dispute
        const orderAge = Date.now() - new Date(data.order.createdAt).getTime();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (orderAge > twentyFourHours) {
          alert(
            "This order is not eligible for dispute. Disputes can only be opened within 24 hours of order creation."
          );
          router.push("/orders");
          return;
        }
      } else {
        alert("Failed to load order details");
        router.push("/orders");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to load order");
      router.push("/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    setImages([...images, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      alert("Please provide a description");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("reason", reason);
      formData.append("description", description);

      images.forEach((image) => {
        formData.append("images", image);
      });

      const res = await fetch("/api/disputes/create", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        alert("Dispute created successfully! Our team will review it shortly.");
        router.push("/orders");
      } else {
        alert(data.error || "Failed to create dispute");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to create dispute");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const orderAge = Date.now() - new Date(order.createdAt).getTime();
  const hoursRemaining = Math.max(
    0,
    24 - Math.floor(orderAge / (60 * 60 * 1000))
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <PageTitle title="Open Dispute" />

        {/* Time Warning */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={20}
              className="text-orange-600 shrink-0 mt-0.5"
            />
            <div>
              <p className="font-semibold text-orange-900 mb-1">
                {hoursRemaining} hours remaining
              </p>
              <p className="text-sm text-orange-800">
                Disputes can only be opened within 24 hours of order creation.
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h2 className="font-semibold text-slate-800 mb-4">Order Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Order ID</span>
              <span className="font-mono text-slate-800">
                {order.orderNumber}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Total Amount</span>
              <span className="font-semibold text-slate-800">
                ₨{order.totalAmount}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Order Date</span>
              <span className="text-slate-800">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-3 mt-3">
              <p className="text-sm text-slate-600 mb-2">Products</p>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3 text-sm"
                  >
                    {item.images && item.images[0] && (
                      <img
                        src={item.images[0]}
                        alt={item.productName}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">
                        {item.productName}
                      </p>
                      <p className="text-slate-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dispute Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-slate-200 p-6"
        >
          <h2 className="font-semibold text-slate-800 mb-4">
            Dispute Information
          </h2>

          <div className="space-y-4">
            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reason for Dispute *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="CODE_NOT_WORKING">
                  Gift Card Code Not Working
                </option>
                <option value="WRONG_CODE_RECEIVED">Received Wrong Code</option>
                <option value="INCOMPLETE_DELIVERY">
                  Missing Codes / Incomplete Delivery
                </option>
                <option value="PAYMENT_ISSUES">
                  Payment Deducted But No Order
                </option>
                <option value="REFUND_REQUEST">Refund Request</option>
                <option value="OTHER">Other Issue</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Describe Your Issue *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="6"
                placeholder="Please provide detailed information about your issue. Include any error messages, steps you've tried, or relevant details..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Minimum 20 characters required
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Upload Evidence (Optional)
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Upload screenshots or photos that support your dispute (Max 5
                images)
              </p>

              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="imageUpload"
                  disabled={images.length >= 5}
                />
                <label
                  htmlFor="imageUpload"
                  className={`cursor-pointer flex flex-col items-center ${
                    images.length >= 5 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Upload size={32} className="text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600">
                    Click to upload images
                  </p>
                  <p className="text-xs text-slate-500">
                    {images.length}/5 images uploaded
                  </p>
                </label>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Important Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> Our support team will review your
                dispute within 24-48 hours. You will be notified via email about
                the status. Please check your email regularly for updates.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting || description.length < 20}
                className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Dispute"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/orders")}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateDisputePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      }
    >
      <DisputeCreateContent />
    </Suspense>
  );
}
