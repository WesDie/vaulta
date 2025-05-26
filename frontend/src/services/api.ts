import axios from "axios";
import { MediaFile, Tag, Collection, ApiResponse, MediaQuery } from "@/types";

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
};

// Tags API
export const tagsApi = {
  getTags: async (): Promise<ApiResponse<Tag[]>> => {
    const response = await api.get("/api/tags");
    return response.data;
  },

  createTag: async (tag: Partial<Tag>): Promise<ApiResponse<Tag>> => {
    const response = await api.post("/api/tags", tag);
    return response.data;
  },

  updateTag: async (
    id: string,
    tag: Partial<Tag>
  ): Promise<ApiResponse<Tag>> => {
    const response = await api.put(`/api/tags/${id}`, tag);
    return response.data;
  },

  deleteTag: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/tags/${id}`);
    return response.data;
  },
};

// Collections API (placeholder for future implementation)
export const collectionsApi = {
  getCollections: async (): Promise<ApiResponse<Collection[]>> => {
    // This endpoint doesn't exist yet in the backend
    return { success: true, data: [] };
  },
};

export { api };
