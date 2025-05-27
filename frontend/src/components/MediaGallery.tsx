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
      return "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12";
    case "medium":
      return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7";
    case "large":
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
    default:
      return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7";
  }
};

export function MediaGallery({ filters, viewMode }: MediaGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: response, isLoading, error } = useMediaFiles(filters);
  const galleryRef = useRef<HTMLDivElement>(null);

  const mediaFiles = response?.data || [];
  const gridClasses = getGridClasses(viewMode.size);

  // Animate gallery items on load
  useEffect(() => {
    if (mediaFiles.length > 0 && galleryRef.current) {
      const items = galleryRef.current.querySelectorAll(".media-item");
      gsap.fromTo(
        items,
        {
          opacity: 0,
          y: 30,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.05,
          ease: "power3.out",
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
      // You might want to add a toast notification here for success
      // For now, the UI will update when the data is refetched
      closeModal();
      // Optionally trigger a refetch of media files
      window.location.reload(); // Simple solution - you might want to use a better state management
    } catch (error) {
      console.error("Failed to delete media:", error);
      // You might want to add a toast notification here for error
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <div className="w-48 h-4 rounded bg-border animate-pulse"></div>
        </div>
        <div className={`grid ${gridClasses} gap-6`}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="bg-muted aspect-square rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 text-muted-foreground">
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
          <h3 className="mb-3 text-xl font-semibold text-foreground">
            Something went wrong
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            We couldn't load your media files. Please refresh the page or try
            again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 btn btn-primary"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (mediaFiles.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 text-muted-foreground animate-float">
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
          <h3 className="mb-3 text-xl font-semibold text-foreground">
            {filters.search ||
            filters.selectedTags.length > 0 ||
            filters.mimeType
              ? "No matches found"
              : "No media yet"}
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            {filters.search ||
            filters.selectedTags.length > 0 ||
            filters.mimeType
              ? "Try adjusting your search criteria or filters to find what you're looking for."
              : "Start by uploading some images or videos to build your collection."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Results info */}
      <div className="flex items-center justify-between mb-8">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {mediaFiles.length}
          </span>{" "}
          {mediaFiles.length === 1 ? "item" : "items"}
          {response?.pagination && (
            <span className="ml-2 text-muted-foreground">
              • Page {response.pagination.page} of{" "}
              {response.pagination.totalPages}
            </span>
          )}
        </div>

        {/* Grid size indicator */}
        <div className="font-mono text-xs text-muted-foreground">
          {viewMode.size.toUpperCase()}
        </div>
      </div>

      {/* Media grid */}
      <div ref={galleryRef} className={`grid ${gridClasses} gap-6`}>
        {mediaFiles.map((media, index) => (
          <div
            key={media.id}
            className="media-item"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <MediaCard
              media={media}
              size={viewMode.size}
              onSelect={handleMediaSelect}
            />
          </div>
        ))}
      </div>

      {/* Pagination hint */}
      {response?.pagination && response.pagination.totalPages > 1 && (
        <div className="mt-12 text-center">
          <div className="inline-flex items-center px-4 py-2 text-sm rounded-full text-muted-foreground bg-muted">
            <span className="w-2 h-2 mr-2 rounded-full bg-muted-foreground"></span>
            More content available
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
        onDelete={handleDeleteMedia}
      />
    </div>
  );
}
