import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { MediaModalProps } from "./types";
import { MediaViewer } from "./MediaViewer";
import { MetadataSidebar } from "./MetadataSidebar";
import { MediaControls } from "./MediaControls";
import { ConfirmDialog } from "./ConfirmDialog";

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
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const isImage = media?.mimeType.startsWith("image/") || false;

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (media && onDelete) {
      onDelete(media.id);
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
  }, [isOpen, media?.id]);

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

  if (!isOpen || !media) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Modern backdrop with blur */}
      <div
        ref={backdropRef}
        className="absolute inset-0 backdrop-blur-xl bg-background/75"
        onClick={onClose}
      />

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
            media={media}
            isLoading={isLoading}
            onLoadingChange={setIsLoading}
            onHeightChange={setImageContainerHeight}
            onResetTransform={handleResetTransform}
          />
        </div>

        {/* Metadata sidebar */}
        <MetadataSidebar
          media={media}
          showMetadata={showMetadata}
          onClose={onClose}
          imageContainerHeight={imageContainerHeight}
        />
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Media File"
        message={`Are you sure you want to delete "${media?.filename}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
}
