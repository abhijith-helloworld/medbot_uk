"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAlertSocket } from "@/hooks/useAlertSocket";
import { CircleAlert } from "lucide-react";
import { toast } from "sonner";

interface NotificationItem {
  id: string;
  notification: string;
  icon?: string;
  read: boolean;
  timestamp: number;
}

interface AlertContextType {
  alertMessage: string | null;
  clearAlert: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (msg: string, icon?: string) => void;
  clearNotifications: () => void;
  markAllAsRead: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const { alertMessage: socketAlert, setAlertMessage, notifications: socketNotifications } =
    useAlertSocket();

  const [alertMessage, setAlertState] = useState<string | null>(null);
  const [showAsPopup, setShowAsPopup] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // 🔥 Sync socket notifications and show toasts
  useEffect(() => {
    if (!socketNotifications || socketNotifications.length === 0) return;

    const now = Date.now();
    const notificationsToAdd: NotificationItem[] = [];

    socketNotifications.forEach((n: any) => {
      const exists = notifications.some(
        (p) => p.notification === n.notification && now - p.timestamp < 1500
      );

      if (!exists) {
        notificationsToAdd.push({
          id: `${n.notification}-${now}-${Math.random()}`,
          notification: n.notification,
          icon: n.icon ?? "info",
          read: false,
          timestamp: now,
        });
      }
    });

    // Only update state and show toasts if there are new notifications
    if (notificationsToAdd.length > 0) {
      setNotifications((prev) => [...notificationsToAdd, ...prev]);

      // Show ONE toast per new notification
      notificationsToAdd.forEach((n) => {
        switch (n.icon) {
          case "error":
            toast.error(n.notification);
            break;
          case "warning":
            toast.warning(n.notification);
            break;
          case "success":
            toast.success(n.notification);
            break;
          case "info":
            toast.error(n.notification);
            break;
          default:
            toast.error(n.notification);
        }
      });
    }
  }, [socketNotifications]);

  // 🔥 Manage urgent popup (for critical alerts only)
  useEffect(() => {
    if (!socketAlert) return;

    const { icon, notification } = socketAlert;

    // Show popup only for errors and warnings
    if (icon === "error" || icon === "warning") {
      setAlertState(notification);
      setShowAsPopup(true);
      setTimeout(() => setShowAsPopup(false), 8000);
    }

    if (icon === "success") {
      setTimeout(() => clearAlert(), 3000);
    }
  }, [socketAlert]);

  const clearAlert = () => {
    setAlertState(null);
    setShowAsPopup(false);
    setAlertMessage(null);
  };

  const addNotification = (msg: string, icon = "info") => {
    const newNotif = {
      id: `${msg}-${Date.now()}`,
      notification: msg,
      icon,
      read: false,
      timestamp: Date.now(),
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Show Sonner toast
    switch (icon) {
      case "error":
        toast.error(msg);
        break;
      case "warning":
        toast.warning(msg);
        break;
      case "success":
        toast.success(msg);
        break;
      case "info":
        toast.error(msg);
        break;
      default:
        toast.error(msg);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AlertContext.Provider
      value={{
        alertMessage,
        clearAlert,
        notifications,
        unreadCount,
        addNotification,
        clearNotifications,
        markAllAsRead,
      }}
    >
      {/* Urgent Popup (for critical alerts only) */}
      {alertMessage && showAsPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>

          <div className="relative bg-red-300 dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border-4 border-red-500">
            <div className="text-center">
              <CircleAlert className="mx-auto mb-4 h-12 w-12 text-red-600" />
              <h3 className="text-xl font-bold text-white mb-2">URGENT ALERT</h3>

              <p className="text-gray-900 dark:text-gray-200 mb-4">
                {alertMessage}
              </p>

              <button
                onClick={clearAlert}
                className="bg-white hover:bg-red-600 hover:text-white px-8 py-4 rounded-full transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert must be used inside AlertProvider");
  return ctx;
}