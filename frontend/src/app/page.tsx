"use client";

import { useState } from "react";
import { MediaGallery } from "@/components/MediaGallery";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { FilterState, ViewMode } from "@/types";

const initialFilters: FilterState = {
  search: "",
  selectedTags: [],
  selectedCollections: [],
  mimeType: "",
  sortBy: "dateTaken",
  sortOrder: "desc",
};

const initialViewMode: ViewMode = {
  type: "grid",
  size: "medium",
};

export default function HomePage() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="flex max-h-screen min-h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0"
        } overflow-hidden`}
      >
        <Sidebar filters={filters} onFiltersChange={updateFilters} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden bg-background">
        <Header
          filters={filters}
          onFiltersChange={updateFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-hidden">
          <div className="h-full">
            <MediaGallery filters={filters} viewMode={viewMode} />
          </div>
        </main>
      </div>
    </div>
  );
}
