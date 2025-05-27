"use client";

import { FilterState, ViewMode } from "@/types";
import { UploadButton } from "./UploadButton";
import { useTheme } from "./ThemeProvider";
import { useQueryClient } from "react-query";

interface HeaderProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  viewMode: ViewMode;
  onViewModeChange: (viewMode: ViewMode) => void;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
}

export function Header({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  sidebarOpen,
  onSidebarToggle,
}: HeaderProps) {
  const queryClient = useQueryClient();
  const { theme, toggleTheme } = useTheme();

  const handleUploadComplete = () => {
    // Invalidate media queries to refetch data
    queryClient.invalidateQueries(["media"]);
  };

  return (
    <header className="px-6 py-4 border-b glass-card border-gray-200/50 dark:border-gray-800/50">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-6">
          <button
            onClick={onSidebarToggle}
            className="p-2 transition-colors rounded-lg btn-ghost hover:bg-gray-100 dark:hover:bg-gray-800"
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-black rounded-lg dark:bg-white">
              <span className="text-sm font-bold text-white dark:text-black">
                V
              </span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Vaulta
            </h1>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-lg mx-8">
          <div className="relative">
            <svg
              className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search your media..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ search: e.target.value })}
              className="w-full pl-10 pr-4 border-0 input bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-gray-100 rounded-lg dark:bg-gray-900">
            <button
              onClick={() => onViewModeChange({ ...viewMode, type: "grid" })}
              className={`p-2 rounded-md transition-all ${
                viewMode.type === "grid"
                  ? "bg-white dark:bg-gray-800 shadow-sm"
                  : "hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
              title="Grid view"
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
                  d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange({ ...viewMode, type: "list" })}
              className={`p-2 rounded-md transition-all ${
                viewMode.type === "list"
                  ? "bg-white dark:bg-gray-800 shadow-sm"
                  : "hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
              title="List view"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Grid Size */}
          <div className="flex items-center p-1 bg-gray-100 rounded-lg dark:bg-gray-900">
            {(["small", "medium", "large"] as const).map((size) => (
              <button
                key={size}
                onClick={() => onViewModeChange({ ...viewMode, size })}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-all ${
                  viewMode.size === size
                    ? "bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-gray-100"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                {size.charAt(0).toUpperCase()}
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 transition-colors rounded-lg btn-ghost hover:bg-gray-100 dark:hover:bg-gray-800"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
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
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
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
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          {/* Upload Button */}
          <UploadButton onUploadComplete={handleUploadComplete} />
        </div>
      </div>
    </header>
  );
}
