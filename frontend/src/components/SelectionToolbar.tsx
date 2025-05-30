"use client";

import { useState } from "react";

interface SelectionToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkDelete: () => Promise<void>;
  onExitSelection: () => void;
  isDeleting?: boolean;
}

export function SelectionToolbar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
  onExitSelection,
  isDeleting = false,
}: SelectionToolbarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (selectedCount === 0) return;

    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      await onBulkDelete();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Delete failed:", error);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="sticky top-0 z-20 mb-6">
      <div className="border shadow-xl backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-gray-900/5">
        <div className="flex items-center justify-between p-4">
          {/* Left side - Selection info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl dark:bg-blue-900/30">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
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
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {selectedCount} selected
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {totalCount} total items
                </div>
              </div>
            </div>

            {/* Selection actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onSelectAll}
                disabled={selectedCount === totalCount}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Ctrl/Cmd + A"
              >
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="2"
                    ry="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                Select All
              </button>
              <button
                onClick={onClearSelection}
                disabled={selectedCount === 0}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-3">
            {/* Keyboard shortcuts hint */}
            <div className="items-center hidden px-3 py-2 space-x-4 text-xs text-gray-500 rounded-lg lg:flex dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
              <span>⌘A Select All</span>
              <span>⌫ Delete</span>
              <span>⎋ Exit</span>
            </div>

            {/* Delete button */}
            {!showDeleteConfirm ? (
              <button
                onClick={handleDelete}
                disabled={selectedCount === 0 || isDeleting}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-all duration-200 bg-red-600 shadow-lg disabled:pointer-events-none hover:bg-red-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-red-500/25"
                title="Delete key"
              >
                {isDeleting ? (
                  <svg
                    className="w-4 h-4 mr-2 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
                Delete ({selectedCount})
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-all duration-200 bg-red-600 shadow-lg hover:bg-red-700 rounded-xl"
                >
                  {isDeleting ? (
                    <svg
                      className="w-4 h-4 mr-2 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                  Confirm Delete
                </button>
                <button
                  onClick={cancelDelete}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 dark:text-gray-300 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Exit button */}
            <button
              onClick={onExitSelection}
              className="inline-flex items-center justify-center w-10 h-10 text-gray-500 transition-colors dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              title="Escape key"
            >
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
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
