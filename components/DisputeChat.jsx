"use client";
import { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Paperclip,
  Loader2,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  User,
  Shield,
} from "lucide-react";

const DisputeChat = ({ disputeId, orderId, onClose, isAdmin = false }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [dispute, setDispute] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDispute();
  }, [orderId, disputeId]);

  useEffect(() => {
    if (dispute) {
      fetchMessages();
      // Poll for new messages every 5 seconds
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [dispute]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchDispute = async () => {
    if (disputeId) {
      // If disputeId is provided, use it directly
      setDispute({ id: disputeId });
      return;
    }

    // Otherwise, fetch dispute by orderId
    try {
      const response = await fetch(`/api/orders/${orderId}/dispute`);
      const data = await response.json();
      if (response.ok && data.dispute) {
        setDispute(data.dispute);
      } else {
        setError("No dispute found for this order");
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to fetch dispute:", error);
      setError("Failed to load dispute");
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!dispute) return;

    try {
      const response = await fetch(`/api/disputes/messages/${dispute.id}`);
      const data = await response.json();

      if (response.ok) {
        setMessages(data.messages);
        if (data.dispute) {
          setDispute(data.dispute);
        }
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + attachments.length > 5) {
      alert("Maximum 5 attachments allowed");
      return;
    }
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() && attachments.length === 0) {
      return;
    }

    setSending(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("disputeId", disputeId);
      formData.append("message", newMessage.trim());

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await fetch("/api/disputes/messages/send", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setNewMessage("");
      setAttachments([]);
      fetchMessages();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getMessageAlignment = (message) => {
    if (message.senderType === "SYSTEM") return "center";
    if (isAdmin) {
      return message.senderType === "ADMIN" ? "right" : "left";
    } else {
      return message.senderType === "CUSTOMER" ? "right" : "left";
    }
  };

  const getMessageStyle = (message) => {
    if (message.senderType === "SYSTEM") {
      return "bg-slate-100 text-slate-700 border border-slate-200";
    }
    if (isAdmin) {
      return message.senderType === "ADMIN"
        ? "bg-indigo-600 text-white"
        : "bg-slate-100 text-slate-800";
    } else {
      return message.senderType === "CUSTOMER"
        ? "bg-green-600 text-white"
        : "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-600 to-indigo-700 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Dispute Chat</h2>
              <p className="text-indigo-100 text-sm mt-1">
                Dispute ID: #{disputeId.substring(0, 12)}...
                {dispute && (
                  <span className="ml-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20">
                    {dispute.status}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-500">No messages yet</p>
              <p className="text-sm text-slate-400 mt-2">
                Start the conversation by sending a message below
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const alignment = getMessageAlignment(message);
              const style = getMessageStyle(message);

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    alignment === "right"
                      ? "justify-end"
                      : alignment === "center"
                      ? "justify-center"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] ${
                      alignment === "center" ? "text-center" : ""
                    }`}
                  >
                    {/* Sender Label */}
                    {alignment !== "center" && (
                      <div
                        className={`flex items-center gap-2 mb-1 text-xs text-slate-500 ${
                          alignment === "right" ? "justify-end" : ""
                        }`}
                      >
                        {message.senderType === "ADMIN" ? (
                          <>
                            <Shield size={12} />
                            <span>Admin</span>
                          </>
                        ) : (
                          <>
                            <User size={12} />
                            <span>Customer</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`rounded-2xl px-4 py-3 ${style} ${
                        alignment === "center" ? "inline-block" : ""
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.message}
                      </p>

                      {/* Attachments */}
                      {message.attachments &&
                        message.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.attachments.map((url, idx) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <img
                                  src={url}
                                  alt="Attachment"
                                  className="rounded-lg max-w-full h-auto border border-white/20"
                                />
                              </a>
                            ))}
                          </div>
                        )}

                      {/* Timestamp */}
                      <p
                        className={`text-xs mt-2 ${
                          message.senderType === "SYSTEM"
                            ? "text-slate-500"
                            : alignment === "right"
                            ? "text-white/70"
                            : "text-slate-500"
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 py-3 bg-red-50 border-t border-red-200">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <AlertCircle size={16} />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="px-6 py-3 bg-slate-100 border-t border-slate-200">
            <div className="flex gap-2 flex-wrap">
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="relative bg-white rounded-lg p-2 border border-slate-300 flex items-center gap-2"
                >
                  <ImageIcon size={16} className="text-slate-500" />
                  <span className="text-xs text-slate-700 max-w-[100px] truncate">
                    {file.name}
                  </span>
                  <button
                    onClick={() => removeAttachment(idx)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        {dispute?.status !== "CLOSED" && (
          <form
            onSubmit={handleSendMessage}
            className="p-6 bg-white border-t border-slate-200 rounded-b-2xl"
          >
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                disabled={sending}
              >
                <Paperclip size={20} className="text-slate-600" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={
                  sending || (!newMessage.trim() && attachments.length === 0)
                }
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sending ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </form>
        )}

        {dispute?.status === "CLOSED" && (
          <div className="p-6 bg-slate-100 border-t border-slate-200 rounded-b-2xl text-center">
            <CheckCircle className="mx-auto text-green-600 mb-2" size={24} />
            <p className="text-sm text-slate-600">
              This dispute has been closed
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisputeChat;
