"use client";
import { useState } from "react";
import { X, Star, Loader2, AlertCircle, CheckCircle } from "lucide-react";

const ReviewModal = ({
  orderId,
  productId,
  productName,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/reviews/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          productId,
          rating,
          review: reviewText.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-600 to-indigo-700 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Write a Review</h2>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-indigo-100 text-sm mt-2">{productName}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="text-green-500 mx-auto mb-4" size={64} />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Review Submitted!
              </h3>
              <p className="text-slate-600">Thank you for your feedback</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Rate this product *
                </label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={40}
                        className={`${
                          star <= (hoverRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-slate-300"
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center text-sm text-slate-600 mt-2">
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Very Good"}
                    {rating === 5 && "Excellent"}
                  </p>
                )}
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Review (Optional)
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows="4"
                  maxLength="500"
                />
                <p className="text-xs text-slate-500 mt-1 text-right">
                  {reviewText.length}/500 characters
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle
                    className="text-red-600 shrink-0 mt-0.5"
                    size={18}
                  />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || rating === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
