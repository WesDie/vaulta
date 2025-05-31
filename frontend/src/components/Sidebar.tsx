"use client";

import { FilterState } from "@/types";
import { StorageInfo } from "./StorageInfo";
import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { mediaApi } from "@/services/api";

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
          <label className="block mb-3 text-xs font-medium text-muted-foreground">
            Tags
          </label>
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
                  className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-input hover:border-accent hover:text-foreground"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
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
