import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { MediaModalProps } from "./types";
import { MediaViewer } from "./MediaViewer";
import { MetadataSidebar } from "./MetadataSidebar";
import { MediaControls } from "./MediaControls";
import { ConfirmDialog } from "./ConfirmDialog";
import { mediaApi } from "@/services/api";
import { MediaFile } from "@/types";

export function MediaModal({
  media,
  isOpen,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  onDelete,
  mediaFiles = [], // Add mediaFiles prop for preloading
}: MediaModalProps & { mediaFiles?: MediaFile[] }) {
  const [showMetadata, setShowMetadata] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageContainerHeight, setImageContainerHeight] = useState<number>(0);
  const [resetTransform, setResetTransform] = useState<(() => void) | null>(
    null
  );
  const [fullMediaData, setFullMediaData] = useState<MediaFile | null>(null);
  const [loadingFullData, setLoadingFullData] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use full media data if available, otherwise fall back to the passed media
  const currentMedia = fullMediaData || media;
  const isImage = currentMedia?.mimeType.startsWith("image/") || false;

  // Handle media data updates (e.g., after EXIF extraction)
  const handleMediaUpdate = (updatedMedia: MediaFile) => {
    setFullMediaData(updatedMedia);
  };

  // Generate preload URLs for adjacent images
  const getPreloadUrls = () => {
    if (!media || !mediaFiles.length) return [];

    const currentIndex = mediaFiles.findIndex((m) => m.id === media.id);
    const preloadUrls: { thumbnailUrl: string; fullImageUrl: string }[] = [];

    // Preload previous image
    if (currentIndex > 0) {
      const prevMedia = mediaFiles[currentIndex - 1];
      if (prevMedia?.mimeType.startsWith("image/")) {
        preloadUrls.push({
          thumbnailUrl: `/api/media/${prevMedia.id}/image?size=thumb`,
          fullImageUrl: `/originals/${prevMedia.filename}`,
        });
      }
    }

    // Preload next image
    if (currentIndex < mediaFiles.length - 1) {
      const nextMedia = mediaFiles[currentIndex + 1];
      if (nextMedia?.mimeType.startsWith("image/")) {
        preloadUrls.push({
          thumbnailUrl: `/api/media/${nextMedia.id}/image?size=thumb`,
          fullImageUrl: `/originals/${nextMedia.filename}`,
        });
      }
    }

    return preloadUrls;
  };

  // Fetch complete media file data when modal opens or media changes
  useEffect(() => {
    if (isOpen && media?.id) {
      setLoadingFullData(true);
      setFullMediaData(null); // Clear previous data

      mediaApi
        .getMediaFile(media.id)
        .then((response) => {
          if (response.success && response.data) {
            setFullMediaData(response.data);
          } else {
            console.error("Failed to fetch full media data:", response.error);
            // Fall back to using the lightweight data
            setFullMediaData(media);
          }
        })
        .catch((error) => {
          console.error("Error fetching full media data:", error);
          // Fall back to using the lightweight data
          setFullMediaData(media);
        })
        .finally(() => {
          setLoadingFullData(false);
        });
    } else if (!isOpen) {
      // Clear full data when modal closes to save memory
      setFullMediaData(null);
    }
  }, [isOpen, media?.id]);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (currentMedia && onDelete) {
      onDelete(currentMedia.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const handleResetTransform = (resetFn: () => void) => {
    setResetTransform(() => resetFn);
  };

  // Enhanced navigation that resets transform and shows immediate feedback
  const handleNavigation = (direction: "previous" | "next") => {
    // Cancel any pending navigation timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    // Reset zoom/pan immediately for better UX
    if (resetTransform) {
      resetTransform();
    }

    // Clear current media data to force fresh loading
    setFullMediaData(null);
    setLoadingFullData(true);

    // Immediately call the navigation handler
    if (direction === "previous" && onPrevious) {
      onPrevious();
    } else if (direction === "next" && onNext) {
      onNext();
    }

    // Set a small timeout to reset loading state if navigation is very quick
    navigationTimeoutRef.current = setTimeout(() => {
      setLoadingFullData(false);
    }, 100);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      // Clean up navigation timeout
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [isOpen, currentMedia?.id]);

  // GSAP animations for modal open/close
  useEffect(() => {
    const backdrop = backdropRef.current;
    const modal = modalRef.current;

    if (!backdrop || !modal) return;

    if (isOpen) {
      // Show animation
      gsap.set(backdrop, { opacity: 0 });
      gsap.set(modal, { scale: 0.8, opacity: 0 });

      gsap.to(backdrop, { opacity: 1, duration: 0.3, ease: "power2.out" });
      gsap.to(modal, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: "back.out(1.2)",
        delay: 0.1,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          if (hasPrevious) handleNavigation("previous");
          break;
        case "ArrowRight":
          if (hasNext) handleNavigation("next");
          break;
        case "i":
        case "I":
          setShowMetadata((prev) => !prev);
          break;
        case "r":
        case "R":
          if (resetTransform) resetTransform();
          break;
        case "Delete":
          if (onDelete) handleDeleteClick();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    hasPrevious,
    hasNext,
    onPrevious,
    onNext,
    onClose,
    resetTransform,
    isImage,
  ]);

  if (!isOpen || !currentMedia) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Modern backdrop with blur */}
      <div
        ref={backdropRef}
        className="absolute inset-0 backdrop-blur-xl bg-background/75"
        onClick={onClose}
      />

      {/* Loading indicator for full data */}
      {loadingFullData && (
        <div className="absolute z-20 flex items-center px-3 py-2 text-sm border rounded-lg top-4 right-4 bg-background/80 backdrop-blur-sm border-border">
          <div className="w-4 h-4 mr-2 border-2 rounded-full border-primary border-t-transparent animate-spin" />
          Loading details...
        </div>
      )}

      {/* Controls */}
      <MediaControls
        showMetadata={showMetadata}
        onToggleMetadata={() => setShowMetadata(!showMetadata)}
        onResetZoom={() => resetTransform && resetTransform()}
        onClose={onClose}
        onPrevious={() => handleNavigation("previous")}
        onNext={() => handleNavigation("next")}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        isImage={isImage}
        onDelete={onDelete ? handleDeleteClick : undefined}
      />

      {/* Main content - now full screen */}
      <div
        ref={modalRef}
        className={`
          relative z-10 flex h-full w-full overflow-hidden
          ${showMetadata ? "lg:flex-row" : "flex-col"}
        `}
      >
        {/* Media viewer - takes full available space */}
        <div
          className={`
            flex-1 h-full w-full
          `}
        >
          <MediaViewer
            key={currentMedia?.id || "no-media"}
            media={currentMedia}
            onHeightChange={setImageContainerHeight}
            onResetTransform={handleResetTransform}
            preloadUrls={getPreloadUrls()}
          />
        </div>

        {/* Metadata sidebar */}
        <MetadataSidebar
          media={currentMedia}
          showMetadata={showMetadata}
          onClose={onClose}
          imageContainerHeight={imageContainerHeight}
          onMediaUpdate={handleMediaUpdate}
        />
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Media File"
        message={`Are you sure you want to delete "${currentMedia?.filename}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
}
