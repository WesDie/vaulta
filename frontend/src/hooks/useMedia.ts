import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "react-query";
import { mediaApi, tagsApi } from "@/services/api";
import { MediaQuery, FilterState } from "@/types";

// Convert FilterState to MediaQuery
const filtersToQuery = (filters: FilterState): MediaQuery => ({
  search: filters.search || undefined,
  tags: filters.selectedTags.length > 0 ? filters.selectedTags : undefined,
  collections:
    filters.selectedCollections.length > 0
      ? filters.selectedCollections
      : undefined,
  mimeType: filters.mimeType || undefined,
  sortBy: filters.sortBy,
  sortOrder: filters.sortOrder,
  limit: 1000, // Increased limit for better infinite loading performance
  // EXIF filters
  camera: filters.camera || undefined,
  lens: filters.lens || undefined,
  focalLengthMin: filters.focalLengthMin || undefined,
  focalLengthMax: filters.focalLengthMax || undefined,
  apertureMin: filters.apertureMin || undefined,
  apertureMax: filters.apertureMax || undefined,
  isoMin: filters.isoMin || undefined,
  isoMax: filters.isoMax || undefined,
});

export const useMediaFiles = (filters: FilterState) => {
  const query = filtersToQuery(filters);

  return useQuery(["media", query], () => mediaApi.getMediaFiles(query), {
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    refetchOnWindowFocus: false,
  });
};

// New infinite query hook for large datasets
export const useInfiniteMediaFiles = (filters: FilterState) => {
  const baseQuery = filtersToQuery(filters);

  return useInfiniteQuery(
    ["media-infinite", baseQuery],
    ({ pageParam = 1 }) =>
      mediaApi.getMediaFiles({ ...baseQuery, page: pageParam }),
    {
      getNextPageParam: (lastPage) => {
        if (lastPage.data && lastPage.pagination) {
          const { page, totalPages } = lastPage.pagination;
          let newPage: number | undefined = Number(page) + 1;
          return Number(page) < Number(totalPages) ? newPage : undefined;
        }
        return undefined;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
      refetchOnWindowFocus: false,
      // Keep only last 5 pages in memory to prevent memory issues
      keepPreviousData: true,
    }
  );
};

export const useMediaFile = (id: string) => {
  return useQuery(["media", id], () => mediaApi.getMediaFile(id), {
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTags = () => {
  return useQuery(["tags"], () => tagsApi.getTags(), {
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useGenerateThumbnail = () => {
  const queryClient = useQueryClient();

  return useMutation((mediaId: string) => mediaApi.generateThumbnail(mediaId), {
    onSuccess: (data, mediaId) => {
      // Invalidate and refetch media queries
      queryClient.invalidateQueries(["media"]);
      // Update specific media file cache if it exists
      queryClient.invalidateQueries(["media", mediaId]);
    },
  });
};

export const useAddTags = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ mediaId, tagIds }: { mediaId: string; tagIds: string[] }) =>
      mediaApi.addTags(mediaId, tagIds),
    {
      onSuccess: (data, { mediaId }) => {
        queryClient.invalidateQueries(["media"]);
        queryClient.invalidateQueries(["media", mediaId]);
      },
    }
  );
};

export const useRemoveTags = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ mediaId, tagIds }: { mediaId: string; tagIds: string[] }) =>
      mediaApi.removeTags(mediaId, tagIds),
    {
      onSuccess: (data, { mediaId }) => {
        queryClient.invalidateQueries(["media"]);
        queryClient.invalidateQueries(["media", mediaId]);
      },
    }
  );
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (tag: { name: string; color?: string }) => tagsApi.createTag(tag),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["tags"]);
      },
    }
  );
};
