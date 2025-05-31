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
  createdAt: Date;
  updatedAt: Date;
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
  dateTaken?: Date;
  gps?: {
    latitude: number;
    longitude: number;
  };
  rawExifData?: Record<string, any>; // Complete EXIF data
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: Date;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  mediaCount: number;
}

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
