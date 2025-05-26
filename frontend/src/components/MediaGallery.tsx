"use client";

import { useState } from "react";
import { FilterState, ViewMode, MediaFile } from "@/types";
import { useMediaFiles } from "@/hooks/useMedia";
import { MediaCard } from "./MediaCard";
import { MediaModal } from "./MediaModal";

interface MediaGalleryProps {
  filters: FilterState;
  viewMode: ViewMode;
}

const getGridClasses = (size: string) => {
  switch (size) {
    case "small":
      return "grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10";
    case "medium":
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
    case "large":
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    default:
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
  }
};

export function MediaGallery({ filters, viewMode }: MediaGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: response, isLoading, error } = useMediaFiles(filters);

  const mediaFiles = response?.data || [];
  const gridClasses = getGridClasses(viewMode.size);

  const handleMediaSelect = (media: MediaFile) => {
    setSelectedMedia(media);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMedia(null);
  };

  const navigateToMedia = (direction: "previous" | "next") => {
    if (!selectedMedia) return;

    const currentIndex = mediaFiles.findIndex((m) => m.id === selectedMedia.id);
    if (currentIndex === -1) return;

    const newIndex =
      direction === "previous" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < mediaFiles.length) {
      setSelectedMedia(mediaFiles[newIndex]);
    }
  };

  const currentIndex = selectedMedia
    ? mediaFiles.findIndex((m) => m.id === selectedMedia.id)
    : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < mediaFiles.length - 1;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className={`grid ${gridClasses} gap-4`}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mb-4 text-gray-400 mx-auto">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Failed to load media
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            There was an error loading your media files. Please try again.
          </p>
        </div>
      </div>
    );
  }

  if (mediaFiles.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mb-4 text-gray-400 mx-auto">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No media found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filters.search ||
            filters.selectedTags.length > 0 ||
            filters.mimeType
              ? "No media matches your current filters. Try adjusting your search criteria."
              : "No media files have been uploaded yet. Add some images or videos to get started."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Results info */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {mediaFiles.length} media file
        {mediaFiles.length !== 1 ? "s" : ""}
        {response?.pagination && (
          <span>
            {" "}
            (Page {response.pagination.page} of {response.pagination.totalPages}
            )
          </span>
        )}
      </div>

      {/* Media grid */}
      <div className={`grid ${gridClasses} gap-4`}>
        {mediaFiles.map((media) => (
          <MediaCard
            key={media.id}
            media={media}
            size={viewMode.size}
            onSelect={handleMediaSelect}
          />
        ))}
      </div>

      {/* Pagination could be added here */}
      {response?.pagination && response.pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="text-sm text-gray-500">
            Pagination controls can be added here
          </div>
        </div>
      )}

      {/* Media Modal */}
      <MediaModal
        media={selectedMedia}
        isOpen={isModalOpen}
        onClose={closeModal}
        onPrevious={hasPrevious ? () => navigateToMedia("previous") : undefined}
        onNext={hasNext ? () => navigateToMedia("next") : undefined}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
      />
    </div>
  );
}
