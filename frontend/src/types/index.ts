export interface MediaFile {
  id: string;
  filename: string;
  originalPath: string;
  thumbnailPath?: string;
  blurHash?: string; // BlurHash for instant placeholder loading
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  createdAt: string;
  updatedAt: string;
  exifData?: ExifData;
  tags: Tag[];
  collections: Collection[];
}

export interface ExifData {
  camera?: string;
  lens?: string;
  focalLength?: number;
  aperture?: number;
  shutterSpeed?: string;
  iso?: number;
  dateTaken?: string;
  gps?: {
    latitude: number;
    longitude: number;
  };
  rawExifData?: Record<string, any>;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  mediaCount?: number;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  mediaCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MediaQuery {
  page?: number;
  limit?: number;
  tags?: string[];
  collections?: string[];
  mimeType?: string;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "filename" | "fileSize" | "dateTaken";
  sortOrder?: "asc" | "desc";
  // EXIF filters
  camera?: string;
  lens?: string;
  focalLengthMin?: number;
  focalLengthMax?: number;
  apertureMin?: number;
  apertureMax?: number;
  isoMin?: number;
  isoMax?: number;
}

export interface ViewMode {
  type: "grid" | "list";
  size: "small" | "medium" | "large";
}

export interface FilterState {
  search: string;
  selectedTags: string[];
  selectedCollections: string[];
  mimeType: string;
  sortBy: "createdAt" | "updatedAt" | "filename" | "fileSize" | "dateTaken";
  sortOrder: "asc" | "desc";
  // EXIF filters
  camera: string;
  lens: string;
  focalLengthMin: number | null;
  focalLengthMax: number | null;
  apertureMin: number | null;
  apertureMax: number | null;
  isoMin: number | null;
  isoMax: number | null;
}

export interface StorageInfo {
  totalSpace: number;
  usedSpace: number;
  freeSpace: number;
  mediaFiles: {
    totalCount: number;
    totalSize: number;
    imageCount: number;
    imageSize: number;
    videoCount: number;
    videoSize: number;
  };
  // For different storage locations
  originals: {
    totalSize: number;
    path: string;
  };
  thumbnails: {
    totalSize: number;
    path: string;
  };
}
