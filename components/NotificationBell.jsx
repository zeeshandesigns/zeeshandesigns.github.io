"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, Check, ExternalLink, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();

      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PUT",
      });

      if (res.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications/mark-all-read", {
        method: "PUT",
      });

      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate if there's an action URL
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      setShowDropdown(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "ORDER_PLACED":
      case "ADMIN_ORDER":
        return "📦";
      case "ORDER_VERIFIED":
        return "✅";
      case "CODE_DELIVERED":
        return "🎁";
      case "WALLET_TOPUP":
        return "💰";
      case "DISPUTE_UPDATE":
      case "ADMIN_DISPUTE":
        return "⚠️";
      case "REFUND_ISSUED":
        return "💸";
      case "ADMIN_PAYMENT":
        return "💳";
      case "SYSTEM_UPDATE":
        return "🔔";
      default:
        return "📢";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-slate-700 hover:bg-slate-100 rounded-full transition"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-slate-500">{unreadCount} unread</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                className="text-xs text-[#1c75bc] hover:text-[#1557a0] font-medium flex items-center gap-1 disabled:opacity-50"
              >
                <Check size={14} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  We'll notify you when something happens
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-slate-50 transition cursor-pointer ${
                      !notification.isRead ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="text-2xl shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={`text-sm font-semibold ${
                              notification.isRead
                                ? "text-slate-700"
                                : "text-slate-900"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-[#1c75bc] rounded-full shrink-0 mt-1"></div>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-400">
                            {formatTime(notification.createdAt)}
                          </span>
                          {notification.actionUrl && (
                            <ExternalLink
                              size={14}
                              className="text-slate-400"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-200 text-center">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  router.push("/notifications");
                }}
                className="text-sm text-[#1c75bc] hover:text-[#1557a0] font-medium"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
