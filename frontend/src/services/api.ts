import axios from "axios";
import {
  MediaFile,
  Tag,
  Collection,
  ApiResponse,
  MediaQuery,
  StorageInfo,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Media API
export const mediaApi = {
  getMediaFiles: async (
    query: MediaQuery
  ): Promise<ApiResponse<MediaFile[]>> => {
    const response = await api.get("/api/media", { params: query });
    return response.data;
  },

  getMediaFile: async (id: string): Promise<ApiResponse<MediaFile>> => {
    const response = await api.get(`/api/media/${id}`);
    return response.data;
  },

  generateThumbnail: async (
    id: string
  ): Promise<ApiResponse<{ thumbnailPath: string }>> => {
    const response = await api.post(`/api/media/${id}/thumbnail`);
    return response.data;
  },

  addTags: async (id: string, tagIds: string[]): Promise<ApiResponse<void>> => {
    const response = await api.post(`/api/media/${id}/tags`, { tagIds });
    return response.data;
  },

  removeTags: async (
    id: string,
    tagIds: string[]
  ): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/media/${id}/tags`, {
      data: { tagIds },
    });
    return response.data;
  },

  deleteMedia: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/media/${id}`);
    return response.data;
  },

  bulkDeleteMedia: async (
    ids: string[]
  ): Promise<
    ApiResponse<{
      success: string[];
      failed: Array<{ id: string; error: string }>;
    }>
  > => {
    const response = await api.delete("/api/media/bulk", {
      data: { ids },
    });
    return response.data;
  },

  extractExif: async (id: string): Promise<ApiResponse<MediaFile>> => {
    const response = await api.post(`/api/media/${id}/extract-exif`);
    return response.data;
  },

  getExifFilterOptions: async (): Promise<
    ApiResponse<{
      cameras: string[];
      lenses: string[];
      focalLengthRange: { min: number; max: number } | null;
      apertureRange: { min: number; max: number } | null;
      isoRange: { min: number; max: number } | null;
    }>
  > => {
    const response = await api.get("/api/media/exif-filter-options");
    return response.data;
  },
};

// Tags API
export const tagsApi = {
  getTags: async (): Promise<ApiResponse<Tag[]>> => {
    const response = await api.get("/api/tags");
    return response.data;
  },

  createTag: async (
    tag: Pick<Tag, "name" | "color">
  ): Promise<ApiResponse<Tag>> => {
    const response = await api.post("/api/tags", tag);
    return response.data;
  },

  updateTag: async (
    id: string,
    tag: Partial<Pick<Tag, "name" | "color">>
  ): Promise<ApiResponse<Tag>> => {
    const response = await api.put(`/api/tags/${id}`, tag);
    return response.data;
  },

  deleteTag: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/tags/${id}`);
    return response.data;
  },
};

// Collections API
export const collectionsApi = {
  getCollections: async (): Promise<ApiResponse<Collection[]>> => {
    const response = await api.get("/api/collections");
    return response.data;
  },

  createCollection: async (
    collection: Pick<Collection, "name" | "description">
  ): Promise<ApiResponse<Collection>> => {
    const response = await api.post("/api/collections", collection);
    return response.data;
  },

  updateCollection: async (
    id: string,
    collection: Partial<Pick<Collection, "name" | "description">>
  ): Promise<ApiResponse<Collection>> => {
    const response = await api.put(`/api/collections/${id}`, collection);
    return response.data;
  },

  deleteCollection: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/collections/${id}`);
    return response.data;
  },
};

// Storage API
export const storageApi = {
  getStorageInfo: async (): Promise<ApiResponse<StorageInfo>> => {
    const response = await api.get("/api/storage");
    return response.data;
  },
};

export { api };
