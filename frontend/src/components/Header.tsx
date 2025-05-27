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
    <header className="px-6 py-4 border-b glass-card border-border">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-6">
          <button
            onClick={onSidebarToggle}
            className="p-2 transition-colors rounded-lg btn-ghost hover:bg-accent"
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
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">
                V
              </span>
            </div>
            <h1 className="text-xl font-semibold text-foreground">Vaulta</h1>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-lg mx-8">
          <div className="relative">
            <svg
              className="absolute w-4 h-4 transform -translate-y-1/2 text-muted-foreground left-3 top-1/2"
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
              className="w-full pl-10 pr-4 border-0 input bg-muted focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-lg bg-muted">
            <button
              onClick={() => onViewModeChange({ ...viewMode, type: "grid" })}
              className={`p-2 rounded-md transition-all ${
                viewMode.type === "grid"
                  ? "bg-background shadow-sm"
                  : "hover:bg-accent"
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
                  ? "bg-background shadow-sm"
                  : "hover:bg-accent"
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
          <div className="flex items-center p-1 rounded-lg bg-muted">
            {(["small", "medium", "large"] as const).map((size) => (
              <button
                key={size}
                onClick={() => onViewModeChange({ ...viewMode, size })}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-all ${
                  viewMode.size === size
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                {size.charAt(0).toUpperCase()}
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 transition-colors rounded-lg btn-ghost hover:bg-accent"
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
