"use client";

import { FilterState } from "@/types";

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
    <div className="p-6 overflow-y-auto sidebar">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold tracking-wider text-gray-900 uppercase dark:text-gray-100">
          Filters
        </h2>
        <div className="mt-2 border-gradient"></div>
      </div>

      {/* Quick Filters */}
      <div className="mb-8">
        <h3 className="mb-4 text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
          File Type
        </h3>
        <div className="space-y-2">
          {quickFilters.map((filter) => (
            <button
              key={filter.name}
              onClick={() => onFiltersChange({ mimeType: filter.mimeType })}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                filters.mimeType === filter.mimeType
                  ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-black font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              {filter.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Direction */}
      <div className="mb-8">
        <h3 className="mb-4 text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
          Order
        </h3>
        <div className="flex p-1 bg-gray-100 rounded-lg dark:bg-gray-900">
          <button
            onClick={() => onFiltersChange({ sortOrder: "desc" })}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
              filters.sortOrder === "desc"
                ? "bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-gray-100"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => onFiltersChange({ sortOrder: "asc" })}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
              filters.sortOrder === "asc"
                ? "bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-gray-100"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Oldest
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-8">
        <h3 className="mb-4 text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
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
                    ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-black border-gray-900 dark:border-gray-100"
                    : "bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600"
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
        <h3 className="mb-4 text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
          Collections
        </h3>
        <div className="space-y-2">
          {collections.map((collection) => {
            const isSelected = filters.selectedCollections.includes(collection);
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
                    ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-black"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100"
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
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() =>
            onFiltersChange({
              search: "",
              selectedTags: [],
              selectedCollections: [],
              mimeType: "",
              sortBy: "createdAt",
              sortOrder: "desc",
            })
          }
          className="w-full py-2 text-sm btn btn-ghost"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
