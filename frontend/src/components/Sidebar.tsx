"use client";

import { FilterState } from "@/types";
import { StorageInfo } from "./StorageInfo";

interface SidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
}

export function Sidebar({ filters, onFiltersChange }: SidebarProps) {
  const quickFilters = [
    { name: "All", mimeType: "" },
    { name: "Images", mimeType: "image/" },
    { name: "Videos", mimeType: "video/" },
    { name: "Documents", mimeType: "application/" },
  ];

  const commonTags = [
    "Landscape",
    "Portrait",
    "Nature",
    "Urban",
    "Travel",
    "Work",
    "Personal",
  ];
  const collections = ["Favorites", "Recent", "Archive", "Shared"];

  return (
    <div className="relative h-full overflow-hidden sidebar">
      {/* Scrollable Content */}
      <div className="h-full p-6 pb-32 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold tracking-wider uppercase text-foreground">
            Filters
          </h2>
          <div className="mt-2 border-gradient"></div>
        </div>

        {/* Quick Filters */}
        <div className="mb-8">
          <h3 className="mb-4 text-xs font-medium tracking-wider uppercase text-muted-foreground">
            File Type
          </h3>
          <div className="space-y-2">
            {quickFilters.map((filter) => (
              <button
                key={filter.name}
                onClick={() => onFiltersChange({ mimeType: filter.mimeType })}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  filters.mimeType === filter.mimeType
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Direction */}
        <div className="mb-8">
          <h3 className="mb-4 text-xs font-medium tracking-wider uppercase text-muted-foreground">
            Order
          </h3>
          <div className="flex p-1 rounded-lg bg-muted">
            <button
              onClick={() => onFiltersChange({ sortOrder: "desc" })}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                filters.sortOrder === "desc"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              ↓
            </button>
            <button
              onClick={() => onFiltersChange({ sortOrder: "asc" })}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                filters.sortOrder === "asc"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              ↑
            </button>
          </div>
        </div>

        {/* Sort By */}
        <div className="mb-8">
          <h3 className="mb-4 text-xs font-medium tracking-wider uppercase text-muted-foreground">
            Sort By
          </h3>
          <div className="space-y-2">
            {[
              { key: "dateTaken", label: "Photo Date", icon: "📷" },
              { key: "createdAt", label: "Upload Date", icon: "📤" },
              { key: "filename", label: "File Name", icon: "📄" },
              { key: "fileSize", label: "File Size", icon: "💾" },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => onFiltersChange({ sortBy: option.key as any })}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center space-x-3 ${
                  filters.sortBy === option.key
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <span className="text-base">{option.icon}</span>
                <span>{option.label}</span>
                {option.key === "dateTaken" && (
                  <span className="ml-auto text-xs opacity-70">EXIF</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-8">
          <h3 className="mb-4 text-xs font-medium tracking-wider uppercase text-muted-foreground">
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {commonTags.map((tag) => {
              const isSelected = filters.selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => {
                    const newTags = isSelected
                      ? filters.selectedTags.filter((t) => t !== tag)
                      : [...filters.selectedTags, tag];
                    onFiltersChange({ selectedTags: newTags });
                  }}
                  className={`px-3 py-1 text-xs rounded-full border transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border hover:border-accent"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Collections */}
        <div className="mb-8">
          <h3 className="mb-4 text-xs font-medium tracking-wider uppercase text-muted-foreground">
            Collections
          </h3>
          <div className="space-y-2">
            {collections.map((collection) => {
              const isSelected =
                filters.selectedCollections.includes(collection);
              return (
                <button
                  key={collection}
                  onClick={() => {
                    const newCollections = isSelected
                      ? filters.selectedCollections.filter(
                          (c) => c !== collection
                        )
                      : [...filters.selectedCollections, collection];
                    onFiltersChange({ selectedCollections: newCollections });
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <span>{collection}</span>
                  {isSelected && (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reset Filters */}
        <div className="pt-4 border-t border-border">
          <button
            onClick={() =>
              onFiltersChange({
                search: "",
                selectedTags: [],
                selectedCollections: [],
                mimeType: "",
                sortBy: "dateTaken",
                sortOrder: "desc",
              })
            }
            className="w-full py-2 text-sm btn btn-ghost"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Storage Information - Absolutely Positioned at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
        <div className="p-4 pt-4 border-t rounded-lg border-border bg-background/95 backdrop-blur-sm">
          <StorageInfo />
        </div>
      </div>
    </div>
  );
}
