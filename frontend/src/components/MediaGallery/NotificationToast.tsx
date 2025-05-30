import { Notification } from "@/hooks/useNotifications";

interface NotificationToastProps {
  notification: Notification;
  onDismiss: () => void;
}

export function NotificationToast({
  notification,
  onDismiss,
}: NotificationToastProps) {
  return (
    <div
      className={`fixed bottom-6 right-6 px-4 py-3 rounded-2xl shadow-2xl z-50 backdrop-blur-xl border transition-all duration-300 ${
        notification.type === "success"
          ? "bg-green-500/90 text-white border-green-400/50"
          : notification.type === "error"
          ? "bg-red-500/90 text-white border-red-400/50"
          : "bg-blue-500/90 text-white border-blue-400/50"
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {notification.type === "success" ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : notification.type === "error" ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>
        <span className="text-sm font-medium">{notification.message}</span>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 ml-3 transition-colors text-white/80 hover:text-white"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
