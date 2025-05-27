import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useTheme } from "../ThemeProvider";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
}: ConfirmDialogProps) {
  const { theme } = useTheme();
  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const backdrop = backdropRef.current;
    const dialog = dialogRef.current;

    if (!backdrop || !dialog) return;

    if (isOpen) {
      // Show animation
      gsap.set(backdrop, { opacity: 0 });
      gsap.set(dialog, { scale: 0.8, opacity: 0 });

      gsap.to(backdrop, { opacity: 1, duration: 0.2, ease: "power2.out" });
      gsap.to(dialog, {
        scale: 1,
        opacity: 1,
        duration: 0.3,
        ease: "back.out(1.2)",
        delay: 0.1,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onCancel();
          break;
        case "Enter":
          onConfirm();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className={`
          relative z-10 w-full max-w-md p-6 mx-4 rounded-2xl border
          ${
            theme === "dark"
              ? "bg-gray-900/95 border-white/10 text-white"
              : "bg-white/95 border-black/10 text-black"
          }
          backdrop-blur-xl
        `}
      >
        <div className="mb-4">
          <h3 className="mb-2 text-lg font-semibold">{title}</h3>
          <p
            className={`text-sm ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {message}
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className={`
              px-4 py-2 rounded-lg transition-all duration-200 font-medium
              ${
                theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }
            `}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`
              px-4 py-2 rounded-lg transition-all duration-200 font-medium
              ${
                isDestructive
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : theme === "dark"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }
            `}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
