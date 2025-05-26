export interface MediaFile {
  id: string;
  filename: string;
  originalPath: string;
  thumbnailPath?: string;
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
  sortBy?: "createdAt" | "filename" | "fileSize" | "dateTaken";
  sortOrder?: "asc" | "desc";
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
  sortBy: MediaQuery["sortBy"];
  sortOrder: MediaQuery["sortOrder"];
}
