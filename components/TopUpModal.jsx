"use client";
import { useState } from "react";
import { X, Upload, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

const TopUpModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Amount, 2: Payment Proof, 3: Success
  const [amount, setAmount] = useState("");
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [topUpId, setTopUpId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "Rs";

  const resetForm = () => {
    setStep(1);
    setAmount("");
    setPaymentProof(null);
    setPaymentReference("");
    setTopUpId(null);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAmountSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 100) {
      setError("Minimum top-up amount is PKR 100");
      return;
    }
    if (amountNum > 100000) {
      setError("Maximum top-up amount is PKR 100,000");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/wallet/topup/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountNum }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create top-up request");
      }

      setTopUpId(data.topUp.id);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!paymentProof) {
      setError("Please upload payment proof");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("topUpId", topUpId);
      formData.append("paymentProof", paymentProof);
      formData.append("paymentReference", paymentReference || "N/A");

      const response = await fetch("/api/wallet/topup/submit-payment", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit payment proof");
      }

      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalClose = () => {
    handleClose();
    if (onSuccess) onSuccess();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-linear-to-r from-green-600 to-green-700 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Top Up Wallet</h2>
            <button
              onClick={handleClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div
              className={`flex-1 h-2 rounded-full ${
                step >= 1 ? "bg-white" : "bg-white/30"
              }`}
            />
            <div
              className={`flex-1 h-2 rounded-full ${
                step >= 2 ? "bg-white" : "bg-white/30"
              }`}
            />
            <div
              className={`flex-1 h-2 rounded-full ${
                step >= 3 ? "bg-white" : "bg-white/30"
              }`}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Enter Amount */}
          {step === 1 && (
            <form onSubmit={handleAmountSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Top-up Amount ({currency})
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  min="100"
                  max="100000"
                  step="1"
                  required
                />
                <p className="text-xs text-slate-500 mt-2">
                  Minimum: {currency} 100 | Maximum: {currency} 100,000
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle
                    className="text-red-600 shrink-0 mt-0.5"
                    size={18}
                  />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </form>
          )}

          {/* Step 2: Upload Payment Proof */}
          {step === 2 && (
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-semibold mb-2">
                  Bank Transfer Details:
                </p>
                <p className="text-sm text-blue-800">
                  Bank: HBL
                  <br />
                  Account: 1234-5678-9012
                  <br />
                  Account Title: PakCards
                  <br />
                  Amount:{" "}
                  <strong>
                    {currency} {amount}
                  </strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Payment Reference (Optional)
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="e.g., Transaction ID"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Upload Payment Proof *
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-green-500 transition">
                  <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPaymentProof(e.target.files[0])}
                    className="w-full text-sm"
                    required
                  />
                  {paymentProof && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {paymentProof.name}
                    </p>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Upload screenshot of your bank transfer
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle
                    className="text-red-600 shrink-0 mt-0.5"
                    size={18}
                  />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-lg font-semibold transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="text-green-500" size={64} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Payment Submitted!
              </h3>
              <p className="text-slate-600 mb-6">
                Your payment proof has been submitted for verification. Your
                wallet will be credited within 24 hours after verification.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  <strong>Top-up Amount:</strong> {currency} {amount}
                  <br />
                  <strong>Status:</strong> Pending Verification
                </p>
              </div>
              <button
                onClick={handleFinalClose}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopUpModal;
