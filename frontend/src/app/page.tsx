"use client";

import { useState, useEffect } from "react";
import { MediaGallery } from "@/components/MediaGallery";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { FilterState, ViewMode } from "@/types";
import {
  DEFAULT_FILTERS,
  DEFAULT_VIEW_MODE,
  loadAppState,
  saveFilters,
  saveViewMode,
  saveSidebarOpen,
} from "@/utils/localStorage";

export default function HomePage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<ViewMode>(DEFAULT_VIEW_MODE);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize state from localStorage on client-side
  useEffect(() => {
    const appState = loadAppState();
    setFilters(appState.filters);
    setViewMode(appState.viewMode);
    setSidebarOpen(appState.sidebarOpen);
    setIsLoaded(true);
  }, []);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      saveFilters(filters);
    }
  }, [filters, isLoaded]);

  // Save viewMode to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      saveViewMode(viewMode);
    }
  }, [viewMode, isLoaded]);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      saveSidebarOpen(sidebarOpen);
    }
  }, [sidebarOpen, isLoaded]);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Show loading state to prevent flash of initial content
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-current rounded-full border-t-transparent animate-spin"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

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
