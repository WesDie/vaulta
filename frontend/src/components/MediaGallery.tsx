"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FilterState, ViewMode, MediaFile } from "@/types";
import { useMediaFiles } from "@/hooks/useMedia";
import { MediaCard } from "./MediaCard";
import { MediaModal } from "./MediaModal";
import { mediaApi } from "@/services/api";

interface MediaGalleryProps {
  filters: FilterState;
  viewMode: ViewMode;
}

const getGridClasses = (size: string) => {
  switch (size) {
    case "small":
      return "grid-cols-6 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-20 2xl:grid-cols-24";
    case "medium":
      return "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10";
    case "large":
      return "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5";
    default:
      return "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10";
  }
};

const getListClasses = () => {
  return "flex flex-col space-y-2";
};

export function MediaGallery({ filters, viewMode }: MediaGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: response, isLoading, error } = useMediaFiles(filters);
  const galleryRef = useRef<HTMLDivElement>(null);

  const mediaFiles = response?.data || [];
  const isListView = viewMode.type === "list";
  const gridClasses = isListView
    ? getListClasses()
    : `grid ${getGridClasses(viewMode.size)} gap-1`;

  // Animate gallery items on load
  useEffect(() => {
    if (mediaFiles.length > 0 && galleryRef.current) {
      const items = galleryRef.current.querySelectorAll(".media-item");
      gsap.fromTo(
        items,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.02,
          ease: "power2.out",
        }
      );
    }
  }, [mediaFiles]);

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

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      await mediaApi.deleteMedia(mediaId);
      closeModal();
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete media:", error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="p-2">
        <div
          className={
            isListView
              ? "space-y-2"
              : `grid ${getGridClasses(viewMode.size)} gap-1`
          }
        >
          {Array.from({ length: isListView ? 8 : 24 }).map((_, i) => (
            <div
              key={i}
              className={
                isListView
                  ? "bg-gray-200 h-16 rounded animate-pulse flex items-center space-x-4 p-4"
                  : "bg-gray-200 aspect-square animate-pulse"
              }
            >
              {isListView && (
                <>
                  <div className="w-12 h-12 bg-gray-300 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-3/4 h-3 bg-gray-300 rounded"></div>
                    <div className="w-1/2 h-2 bg-gray-300 rounded"></div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg
              fill="currentColor"
              viewBox="0 0 20 20"
              className="w-full h-full"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Something went wrong
          </h3>
          <p className="mb-4 text-gray-600">
            We couldn't load your media files.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm text-white bg-black rounded hover:bg-gray-800"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  if (mediaFiles.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg
              fill="currentColor"
              viewBox="0 0 20 20"
              className="w-full h-full"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            {filters.search ||
            filters.selectedTags.length > 0 ||
            filters.mimeType
              ? "No matches found"
              : "No media yet"}
          </h3>
          <p className="text-gray-600">
            {filters.search ||
            filters.selectedTags.length > 0 ||
            filters.mimeType
              ? "Try adjusting your search criteria."
              : "Start by uploading some images or videos."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      {/* Results info - minimal */}
      <div className="flex items-center justify-between px-2 mb-3">
        <div className="text-xs text-gray-500">
          {mediaFiles.length} {mediaFiles.length === 1 ? "item" : "items"}
        </div>
        <div className="font-mono text-xs text-gray-400">
          {viewMode.type.toUpperCase()} • {viewMode.size.toUpperCase()}
        </div>
      </div>

      {/* Media grid/list - minimal spacing */}
      <div ref={galleryRef} className={gridClasses}>
        {mediaFiles.map((media, index) => (
          <div
            key={media.id}
            className={isListView ? "media-item" : "media-item"}
          >
            {isListView ? (
              // List view item
              <div
                className="flex items-center p-3 space-x-4 transition-colors rounded cursor-pointer bg-muted/30 hover:bg-muted/20"
                onClick={() => handleMediaSelect(media)}
              >
                <div className="flex-shrink-0 w-12 h-12">
                  <MediaCard media={media} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-primary">
                    {media.filename}
                  </p>
                  <div className="flex items-center mt-1 space-x-4">
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(media.fileSize)}
                    </p>
                    {media.width && media.height && (
                      <p className="text-xs text-muted-foreground">
                        {media.width} × {media.height}
                      </p>
                    )}
                    {media.createdAt && (
                      <p className="text-xs text-muted-foreground">
                        {formatDate(media.createdAt)}
                      </p>
                    )}
                  </div>
                </div>
                {media.tags && media.tags.length > 0 && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
                      {media.tags.length} tags
                    </span>
                  </div>
                )}
              </div>
            ) : (
              // Grid view item
              <MediaCard media={media} onSelect={handleMediaSelect} />
            )}
          </div>
        ))}
      </div>

      {/* Media Modal */}
      <MediaModal
        media={selectedMedia}
        isOpen={isModalOpen}
        onClose={closeModal}
        onPrevious={hasPrevious ? () => navigateToMedia("previous") : undefined}
        onNext={hasNext ? () => navigateToMedia("next") : undefined}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onDelete={handleDeleteMedia}
      />
    </div>
  );
}
