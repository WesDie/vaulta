"use client";

import { FilterState } from "@/types";
import { StorageInfo } from "./StorageInfo";
import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { mediaApi } from "@/services/api";
import { useTags } from "@/hooks/useMedia";
import { Tag } from "./ui/Tag";

interface SidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
}

interface DropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
}

function Dropdown({
  label,
  value,
  options,
  onChange,
  placeholder = "All",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <label className="block mb-2 text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm transition-all border rounded-md border-input bg-background hover:bg-accent text-foreground"
      >
        <span className="truncate">{value || placeholder}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 overflow-y-auto border rounded-md shadow-lg bg-popover border-border max-h-48">
          <button
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className={`w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors ${
              !value ? "bg-accent text-accent-foreground" : ""
            }`}
          >
            {placeholder}
          </button>
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors truncate ${
                value === option ? "bg-accent text-accent-foreground" : ""
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface RangeSliderProps {
  label: string;
  min: number;
  max: number;
  valueMin: number | null;
  valueMax: number | null;
  onChange: (min: number | null, max: number | null) => void;
  step?: number;
  suffix?: string;
}

function RangeSlider({
  label,
  min,
  max,
  valueMin,
  valueMax,
  onChange,
  step = 1,
  suffix = "",
}: RangeSliderProps) {
  const [localMin, setLocalMin] = useState(valueMin ?? min);
  const [localMax, setLocalMax] = useState(valueMax ?? max);
  const [isActive, setIsActive] = useState(
    valueMin !== null || valueMax !== null
  );

  useEffect(() => {
    setLocalMin(valueMin ?? min);
    setLocalMax(valueMax ?? max);
    setIsActive(valueMin !== null || valueMax !== null);
  }, [valueMin, valueMax, min, max]);

  const handleToggle = () => {
    if (isActive) {
      onChange(null, null);
      setIsActive(false);
    } else {
      onChange(localMin, localMax);
      setIsActive(true);
    }
  };

  const handleMinChange = (value: number) => {
    const newMin = Math.min(value, localMax);
    setLocalMin(newMin);
    if (isActive) onChange(newMin, localMax);
  };

  const handleMaxChange = (value: number) => {
    const newMax = Math.max(value, localMin);
    setLocalMax(newMax);
    if (isActive) onChange(localMin, newMax);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">
          {label}
        </label>
        <button
          onClick={handleToggle}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            isActive
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          {isActive ? "ON" : "OFF"}
        </button>
      </div>
      {isActive && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={localMin}
              onChange={(e) => handleMinChange(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="w-12 text-xs text-muted-foreground">
              {localMin}
              {suffix}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={localMax}
              onChange={(e) => handleMaxChange(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="w-12 text-xs text-muted-foreground">
              {localMax}
              {suffix}
            </span>
          </div>
          <div className="text-xs text-center text-muted-foreground">
            {localMin}
            {suffix} - {localMax}
            {suffix}
          </div>
        </div>
      )}
    </div>
  );
}

export function Sidebar({ filters, onFiltersChange }: SidebarProps) {
  const [showExpertFilters, setShowExpertFilters] = useState(false);

  // Fetch EXIF filter options
  const { data: exifOptions } = useQuery(
    ["exif-filter-options"],
    () => mediaApi.getExifFilterOptions(),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      select: (response) => response.data,
    }
  );

  // Fetch actual tags from database
  const tagsQuery = useTags();
  const allTags = tagsQuery.data?.success ? tagsQuery.data.data : [];

  const quickFilters = [
    { name: "All", mimeType: "" },
    { name: "Images", mimeType: "image/" },
    { name: "Videos", mimeType: "video/" },
    { name: "Documents", mimeType: "application/" },
  ];

  const collections = ["Favorites", "Recent", "Archive", "Shared"];

  const hasActiveFilters =
    filters.selectedTags.length > 0 ||
    filters.selectedCollections.length > 0 ||
    filters.mimeType ||
    filters.camera ||
    filters.lens ||
    filters.focalLengthMin !== null ||
    filters.focalLengthMax !== null ||
    filters.apertureMin !== null ||
    filters.apertureMax !== null ||
    filters.isoMin !== null ||
    filters.isoMax !== null;

  const hasActiveExpertFilters =
    filters.camera ||
    filters.lens ||
    filters.focalLengthMin !== null ||
    filters.focalLengthMax !== null ||
    filters.apertureMin !== null ||
    filters.apertureMax !== null ||
    filters.isoMin !== null ||
    filters.isoMax !== null;

  return (
    <div className="relative h-full overflow-hidden">
      {/* Scrollable Content */}
      <div className="h-full p-4 pb-40 space-y-6 overflow-y-scroll">
        {/* Header */}
        <div>
          <h2 className="text-sm font-semibold text-foreground">Filters</h2>
          <div className="h-px mt-2 bg-gradient-to-r from-border to-transparent"></div>
        </div>

        {/* File Type Filters */}
        <div>
          <label className="block mb-3 text-xs font-medium text-muted-foreground">
            File Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {quickFilters.map((filter) => (
              <button
                key={filter.name}
                onClick={() => onFiltersChange({ mimeType: filter.mimeType })}
                className={`px-3 py-2 rounded-md text-sm transition-all border ${
                  filters.mimeType === filter.mimeType
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-accent text-muted-foreground border-input"
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Controls */}
        <div className="space-y-4">
          <Dropdown
            label="Sort By"
            value={
              filters.sortBy === "dateTaken"
                ? "Photo Date"
                : filters.sortBy === "createdAt"
                ? "Upload Date"
                : filters.sortBy === "filename"
                ? "File Name"
                : filters.sortBy === "fileSize"
                ? "File Size"
                : "Photo Date"
            }
            options={["Photo Date", "Upload Date", "File Name", "File Size"]}
            onChange={(value) => {
              const sortBy =
                value === "Photo Date"
                  ? "dateTaken"
                  : value === "Upload Date"
                  ? "createdAt"
                  : value === "File Name"
                  ? "filename"
                  : value === "File Size"
                  ? "fileSize"
                  : "dateTaken";
              onFiltersChange({ sortBy: sortBy as any });
            }}
          />

          <div>
            <label className="block mb-2 text-xs font-medium text-muted-foreground">
              Order
            </label>
            <div className="flex p-1 rounded-md bg-muted">
              <button
                onClick={() => onFiltersChange({ sortOrder: "desc" })}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-all ${
                  filters.sortOrder === "desc"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => onFiltersChange({ sortOrder: "asc" })}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-all ${
                  filters.sortOrder === "asc"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Oldest
              </button>
            </div>
          </div>
        </div>

        {/* Expert Camera Filters */}
        {exifOptions &&
          (exifOptions.cameras.length > 0 || exifOptions.lenses.length > 0) && (
            <div className="border rounded-md border-border">
              <button
                onClick={() => setShowExpertFilters(!showExpertFilters)}
                className="flex items-center justify-between w-full p-3 text-left transition-colors hover:bg-accent"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Camera Filters</span>
                  {hasActiveExpertFilters && (
                    <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showExpertFilters ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showExpertFilters && (
                <div className="p-3 pt-0 space-y-4 border-t border-border">
                  {exifOptions.cameras.length > 0 && (
                    <Dropdown
                      label="Camera"
                      value={filters.camera}
                      options={exifOptions.cameras}
                      onChange={(value) => onFiltersChange({ camera: value })}
                      placeholder="Any Camera"
                    />
                  )}

                  {exifOptions.lenses.length > 0 && (
                    <Dropdown
                      label="Lens"
                      value={filters.lens}
                      options={exifOptions.lenses}
                      onChange={(value) => onFiltersChange({ lens: value })}
                      placeholder="Any Lens"
                    />
                  )}

                  {exifOptions.focalLengthRange && (
                    <RangeSlider
                      label="Focal Length"
                      min={exifOptions.focalLengthRange.min}
                      max={exifOptions.focalLengthRange.max}
                      valueMin={filters.focalLengthMin}
                      valueMax={filters.focalLengthMax}
                      onChange={(min, max) =>
                        onFiltersChange({
                          focalLengthMin: min,
                          focalLengthMax: max,
                        })
                      }
                      suffix="mm"
                    />
                  )}

                  {exifOptions.apertureRange && (
                    <RangeSlider
                      label="Aperture"
                      min={exifOptions.apertureRange.min}
                      max={exifOptions.apertureRange.max}
                      valueMin={filters.apertureMin}
                      valueMax={filters.apertureMax}
                      onChange={(min, max) =>
                        onFiltersChange({ apertureMin: min, apertureMax: max })
                      }
                      step={0.1}
                      suffix="f"
                    />
                  )}

                  {exifOptions.isoRange && (
                    <RangeSlider
                      label="ISO"
                      min={exifOptions.isoRange.min}
                      max={exifOptions.isoRange.max}
                      valueMin={filters.isoMin}
                      valueMax={filters.isoMax}
                      onChange={(min, max) =>
                        onFiltersChange({ isoMin: min, isoMax: max })
                      }
                      step={100}
                    />
                  )}
                </div>
              )}
            </div>
          )}

        {/* Tags */}
        <div>
          <div className="flex items-center justify-between mb-3 h-[20px]">
            <label className="text-xs font-medium text-muted-foreground">
              Tags
            </label>
            {filters.selectedTags.length > 0 && (
              <button
                onClick={() => onFiltersChange({ selectedTags: [] })}
                className="px-2 py-0.5 text-xs bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded transition-colors"
                title="Clear tag filters"
              >
                Clear ({filters.selectedTags.length})
              </button>
            )}
          </div>
          {tagsQuery.isLoading ? (
            <div className="flex items-center justify-center p-4 border border-dashed rounded-lg bg-muted/20 border-border/50">
              <div className="text-center">
                <div className="w-6 h-6 mx-auto mb-2 animate-spin">
                  <svg
                    className="w-full h-full text-muted-foreground/40"
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
                </div>
                <p className="text-xs text-muted-foreground">Loading tags...</p>
              </div>
            </div>
          ) : allTags && allTags.length > 0 ? (
            <div className="space-y-2">
              {allTags.map((tag) => {
                const isSelected = filters.selectedTags.includes(tag.name);
                const rgb = tag.color
                  ? {
                      r: parseInt(tag.color.slice(1, 3), 16),
                      g: parseInt(tag.color.slice(3, 5), 16),
                      b: parseInt(tag.color.slice(5, 7), 16),
                    }
                  : { r: 99, g: 102, b: 241 }; // Default indigo color

                return (
                  <button
                    key={tag.id}
                    onClick={() => {
                      const isCurrentlySelected = filters.selectedTags.includes(
                        tag.name
                      );
                      const newTags = isCurrentlySelected
                        ? filters.selectedTags.filter((t) => t !== tag.name)
                        : [...filters.selectedTags, tag.name];
                      onFiltersChange({ selectedTags: newTags });
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between border group hover:shadow-sm ${
                      isSelected
                        ? "border-primary/30 shadow-sm"
                        : "border-border hover:border-border/80"
                    }`}
                    style={{
                      backgroundColor: isSelected
                        ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`
                        : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-3 h-3 rounded-full flex-shrink-0 transition-all ${
                          isSelected ? "scale-110 shadow-sm" : "opacity-60"
                        }`}
                        style={{
                          backgroundColor: tag.color || "#6366F1",
                          boxShadow: isSelected
                            ? `0 0 6px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`
                            : `0 0 3px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
                        }}
                      />
                      <span
                        className={`font-medium truncate transition-colors ${
                          isSelected
                            ? "text-foreground"
                            : "text-muted-foreground group-hover:text-foreground"
                        }`}
                        title={tag.name}
                      >
                        {tag.name}
                      </span>
                      {tag.mediaCount !== undefined && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full transition-colors ${
                            isSelected
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground"
                          }`}
                        >
                          {tag.mediaCount}
                        </span>
                      )}
                    </div>
                    <div
                      className={`flex-shrink-0 transition-all ${
                        isSelected
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-95"
                      }`}
                    >
                      <svg
                        className="w-4 h-4 text-primary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center p-4 border border-dashed rounded-lg bg-muted/20 border-border/50">
              <div className="text-center">
                <svg
                  className="w-6 h-6 mx-auto mb-2 text-muted-foreground/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <p className="text-xs text-muted-foreground">
                  No tags available
                </p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  Tags will appear here as you create them
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Collections */}
        <div>
          <label className="block mb-3 text-xs font-medium text-muted-foreground">
            Collections
          </label>
          <div className="space-y-1">
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
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all flex items-center justify-between border ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-accent text-muted-foreground border-input"
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
                camera: "",
                lens: "",
                focalLengthMin: null,
                focalLengthMax: null,
                apertureMin: null,
                apertureMax: null,
                isoMin: null,
                isoMax: null,
              })
            }
            disabled={!hasActiveFilters}
            className={`w-full py-2 text-sm rounded-md transition-all ${
              hasActiveFilters
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            Reset All Filters
          </button>
        </div>
      </div>

      {/* Storage Information - Absolutely Positioned at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <div className="p-4 pt-4 border-t rounded-md border-border bg-background/95 backdrop-blur-sm">
          <StorageInfo />
        </div>
      </div>
    </div>
  );
}
