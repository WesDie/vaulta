import { FilterState, ViewMode } from "@/types";

// Default values
export const DEFAULT_FILTERS: FilterState = {
  search: "",
  selectedTags: [],
  selectedCollections: [],
  mimeType: "",
  sortBy: "dateTaken",
  sortOrder: "desc",
  // EXIF filters
  camera: "",
  lens: "",
  focalLengthMin: null,
  focalLengthMax: null,
  apertureMin: null,
  apertureMax: null,
  isoMin: null,
  isoMax: null,
};

export const DEFAULT_VIEW_MODE: ViewMode = {
  type: "grid",
  size: "medium",
};

// Storage keys
const STORAGE_KEYS = {
  FILTERS: "vaulta-filters",
  VIEW_MODE: "vaulta-viewMode",
  SIDEBAR_OPEN: "vaulta-sidebarOpen",
} as const;

// Helper functions for safe localStorage operations
const isClient = (): boolean => typeof window !== "undefined";

const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (!isClient()) {
    return defaultValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToLocalStorage = <T>(key: string, value: T): void => {
  if (!isClient()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error saving ${key} to localStorage:`, error);
  }
};

// Specific localStorage functions for app state
export const loadFilters = (): FilterState => {
  return getFromLocalStorage(STORAGE_KEYS.FILTERS, DEFAULT_FILTERS);
};

export const saveFilters = (filters: FilterState): void => {
  saveToLocalStorage(STORAGE_KEYS.FILTERS, filters);
};

export const loadViewMode = (): ViewMode => {
  return getFromLocalStorage(STORAGE_KEYS.VIEW_MODE, DEFAULT_VIEW_MODE);
};

export const saveViewMode = (viewMode: ViewMode): void => {
  saveToLocalStorage(STORAGE_KEYS.VIEW_MODE, viewMode);
};

export const loadSidebarOpen = (): boolean => {
  return getFromLocalStorage(STORAGE_KEYS.SIDEBAR_OPEN, true);
};

export const saveSidebarOpen = (sidebarOpen: boolean): void => {
  saveToLocalStorage(STORAGE_KEYS.SIDEBAR_OPEN, sidebarOpen);
};

// Initialize all state from localStorage
export const loadAppState = () => {
  return {
    filters: loadFilters(),
    viewMode: loadViewMode(),
    sidebarOpen: loadSidebarOpen(),
  };
};
