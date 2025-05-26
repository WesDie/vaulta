"use client";

import { FilterState } from "@/types";

interface SidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
}

export function Sidebar({ filters, onFiltersChange }: SidebarProps) {
  return (
    <div className="sidebar p-4">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>

      {/* Search */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Search</label>
        <input
          type="text"
          className="input w-full"
          placeholder="Search files..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
        />
      </div>

      {/* Tags */}
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Tags</h3>
        <div className="space-y-1">
          {["Landscape", "Portrait", "Nature", "Urban", "Travel"].map((tag) => (
            <label key={tag} className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">{tag}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Collections */}
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Collections</h3>
        <div className="space-y-1">
          {["Favorites", "Recent Shoots", "Best of 2024"].map((collection) => (
            <label key={collection} className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">{collection}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
