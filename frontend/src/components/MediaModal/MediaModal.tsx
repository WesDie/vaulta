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
}: MediaModalProps) {
  const [isLoading, setIsLoading] = useState(true);
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

  // Use full media data if available, otherwise fall back to the passed media
  const currentMedia = fullMediaData || media;
  const isImage = currentMedia?.mimeType.startsWith("image/") || false;

  // Handle media data updates (e.g., after EXIF extraction)
  const handleMediaUpdate = (updatedMedia: MediaFile) => {
    setFullMediaData(updatedMedia);
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

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
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
          if (hasPrevious && onPrevious) onPrevious();
          break;
        case "ArrowRight":
          if (hasNext && onNext) onNext();
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
        onPrevious={onPrevious}
        onNext={onNext}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        isImage={isImage}
        onDelete={onDelete ? handleDeleteClick : undefined}
      />

      {/* Main content */}
      <div
        ref={modalRef}
        className={`
          relative z-10 flex max-h-[95vh] max-w-[95vw] overflow-hidden rounded-2xl border border-border
          ${showMetadata ? "lg:flex-row" : "flex-col"}
        `}
      >
        {/* Media viewer */}
        <div
          className={`
            flex-1
          `}
        >
          <MediaViewer
            media={currentMedia}
            isLoading={isLoading}
            onLoadingChange={setIsLoading}
            onHeightChange={setImageContainerHeight}
            onResetTransform={handleResetTransform}
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
