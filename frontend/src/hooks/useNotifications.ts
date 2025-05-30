import { useState, useEffect } from "react";

export interface Notification {
  message: string;
  type: "success" | "error" | "info";
}

export function useNotifications() {
  const [notification, setNotification] = useState<Notification | null>(null);

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (notification: Notification) => {
    setNotification(notification);
  };

  const hideNotification = () => {
    setNotification(null);
  };

  return {
    notification,
    showNotification,
    hideNotification,
  };
}
