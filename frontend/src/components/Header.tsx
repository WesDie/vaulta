"use client";

import { FilterState, ViewMode } from "@/types";
import { UploadButton } from "./UploadButton";
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

  const handleUploadComplete = () => {
    // Invalidate media queries to refetch data
    queryClient.invalidateQueries(["media"]);
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onSidebarToggle} className="btn-ghost p-2">
            ☰
          </button>
          <h1 className="text-xl font-bold">Vaulta</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Upload Button */}
          <UploadButton onUploadComplete={handleUploadComplete} />

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewModeChange({ ...viewMode, type: "grid" })}
              className={`btn-ghost p-2 ${
                viewMode.type === "grid" ? "bg-gray-200 dark:bg-gray-700" : ""
              }`}
            >
              ⊞
            </button>
            <button
              onClick={() => onViewModeChange({ ...viewMode, type: "list" })}
              className={`btn-ghost p-2 ${
                viewMode.type === "list" ? "bg-gray-200 dark:bg-gray-700" : ""
              }`}
            >
              ☰
            </button>
          </div>

          {/* Sort Options */}
          <select
            value={filters.sortBy}
            onChange={(e) => onFiltersChange({ sortBy: e.target.value as any })}
            className="input"
          >
            <option value="createdAt">Date Created</option>
            <option value="filename">Filename</option>
            <option value="fileSize">File Size</option>
          </select>
        </div>
      </div>
    </header>
  );
}
