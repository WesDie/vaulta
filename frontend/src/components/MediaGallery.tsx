"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FilterState, ViewMode, MediaFile } from "@/types";
import { useMediaFiles } from "@/hooks/useMedia";
import { MediaCard } from "./MediaCard";
import { MediaModal } from "./MediaModal";
import { SelectionToolbar } from "./SelectionToolbar";
import { ModernCheckbox } from "./ModernCheckbox";
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
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
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

  // Clear selection when switching out of selection mode
  useEffect(() => {
    if (!selectionMode) {
      setSelectedItems(new Set());
    }
  }, [selectionMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case "s":
          if (!selectionMode && mediaFiles.length > 0) {
            event.preventDefault();
            enterSelectionMode();
          }
          break;
        case "escape":
          if (selectionMode) {
            event.preventDefault();
            exitSelectionMode();
          }
          break;
        case "a":
          if (selectionMode && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            selectAll();
          }
          break;
        case "delete":
        case "backspace":
          if (selectionMode && selectedItems.size > 0) {
            event.preventDefault();
            handleBulkDelete();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectionMode, selectedItems, mediaFiles.length]);

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleMediaSelect = (media: MediaFile) => {
    if (selectionMode) {
      toggleItemSelection(media.id);
    } else {
      setSelectedMedia(media);
      setIsModalOpen(true);
    }
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedItems(new Set(mediaFiles.map((m) => m.id)));
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const enterSelectionMode = () => {
    setSelectionMode(true);
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
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

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    const confirmMessage = `Are you sure you want to delete ${
      selectedItems.size
    } item${
      selectedItems.size === 1 ? "" : "s"
    }? This action cannot be undone.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await mediaApi.bulkDeleteMedia(
        Array.from(selectedItems)
      );

      if (response.success && response.data) {
        const { success, failed } = response.data;

        let message = `Successfully deleted ${success.length} item${
          success.length === 1 ? "" : "s"
        }`;
        if (failed.length > 0) {
          message += `. Failed to delete ${failed.length} item${
            failed.length === 1 ? "" : "s"
          }`;
          console.error("Failed deletions:", failed);
        }

        setNotification({ message, type: "success" });

        // Exit selection mode and refresh
        exitSelectionMode();
        window.location.reload();
      } else {
        throw new Error(response.error || "Bulk delete failed");
      }
    } catch (error) {
      console.error("Failed to bulk delete media:", error);
      setNotification({
        message: "Failed to delete selected items. Please try again.",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
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
                  ? "bg-muted-foreground/20 h-16 rounded animate-pulse flex items-center space-x-4 p-4"
                  : "bg-muted-foreground/20 aspect-square animate-pulse"
              }
            >
              {isListView && (
                <>
                  <div className="w-12 h-12 rounded bg-muted-foreground/20"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-3/4 h-3 rounded bg-muted-foreground/20"></div>
                    <div className="w-1/2 h-2 rounded bg-muted-foreground/20"></div>
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
          <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground">
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
          <h3 className="mb-2 text-lg font-medium text-primary">
            Something went wrong
          </h3>
          <p className="mb-4 text-muted-foreground">
            We couldn't load your media files.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm text-white bg-black rounded hover:bg-muted-foreground/20"
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
          <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground">
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
          <h3 className="mb-2 text-lg font-medium text-primary">
            {filters.search ||
            filters.selectedTags.length > 0 ||
            filters.mimeType
              ? "No matches found"
              : "No media yet"}
          </h3>
          <p className="text-muted-foreground">
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
      {/* Selection toolbar */}
      {selectionMode ? (
        <SelectionToolbar
          selectedCount={selectedItems.size}
          totalCount={mediaFiles.length}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
          onBulkDelete={handleBulkDelete}
          onExitSelection={exitSelectionMode}
          isDeleting={isDeleting}
        />
      ) : (
        /* Results info - minimal */
        <div className="flex items-center justify-between px-2 mb-6">
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-muted-foreground">
              {mediaFiles.length} {mediaFiles.length === 1 ? "item" : "items"}
            </div>
            {mediaFiles.length > 0 && (
              <button
                onClick={enterSelectionMode}
                className="flex items-center text-sm btn btn-secondary"
                title="Press 'S' key"
              >
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="2"
                    ry="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                Select
              </button>
            )}
          </div>
          <div className="px-3 py-1 font-mono text-xs rounded-lg text-muted-foreground bg-muted">
            {viewMode.type.toUpperCase()} • {viewMode.size.toUpperCase()}
          </div>
        </div>
      )}

      {/* Media grid/list - minimal spacing */}
      <div ref={galleryRef} className={gridClasses}>
        {mediaFiles.map((media, index) => (
          <div
            key={media.id}
            className={`media-item ${selectionMode ? "selection-mode" : ""}`}
          >
            {isListView ? (
              // List view item
              <div
                className={`flex items-center p-4 space-x-4 transition-all duration-300 rounded-xl cursor-pointer relative overflow-hidden ${
                  selectionMode && selectedItems.has(media.id)
                    ? "selection-list-bg"
                    : "bg-card hover:bg-card/80 shadow-sm hover:shadow-md"
                }`}
                onClick={() => handleMediaSelect(media)}
              >
                {/* Subtle selection glow effect */}
                {selectionMode && selectedItems.has(media.id) && (
                  <div className="selection-list-glow" />
                )}

                {selectionMode && (
                  <div className="z-10 flex-shrink-0">
                    <ModernCheckbox
                      checked={selectedItems.has(media.id)}
                      onChange={(checked) => {
                        if (checked) {
                          setSelectedItems(
                            (prev) => new Set([...Array.from(prev), media.id])
                          );
                        } else {
                          setSelectedItems((prev) => {
                            const newSet = new Set(prev);
                            newSet.delete(media.id);
                            return newSet;
                          });
                        }
                      }}
                      size="md"
                    />
                  </div>
                )}

                <div className="flex-shrink-0 w-12 h-12 overflow-hidden rounded-lg">
                  <MediaCard
                    media={media}
                    selectionMode={selectionMode}
                    onSelect={handleMediaSelect}
                    onToggleSelection={toggleItemSelection}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-card-foreground">
                    {media.filename}
                  </p>
                  <div className="flex items-center mt-1 space-x-4 text-xs text-muted-foreground">
                    <span className="font-medium">
                      {formatFileSize(media.fileSize)}
                    </span>
                    {media.width && media.height && (
                      <span>
                        {media.width} × {media.height}
                      </span>
                    )}
                    {media.createdAt && (
                      <span>{formatDate(media.createdAt)}</span>
                    )}
                  </div>
                </div>
                {media.tags && media.tags.length > 0 && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-primary bg-accent rounded-full">
                      {media.tags.length} tag
                      {media.tags.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              // Grid view item with selection overlay
              <div className="relative group/selection">
                {selectionMode && (
                  <div className="absolute z-20 top-2 left-2">
                    <ModernCheckbox
                      checked={selectedItems.has(media.id)}
                      onChange={(checked) => {
                        if (checked) {
                          setSelectedItems(
                            (prev) => new Set([...Array.from(prev), media.id])
                          );
                        } else {
                          setSelectedItems((prev) => {
                            const newSet = new Set(prev);
                            newSet.delete(media.id);
                            return newSet;
                          });
                        }
                      }}
                      size="md"
                    />
                  </div>
                )}

                {/* Selection overlay for better visual feedback */}
                {selectionMode && selectedItems.has(media.id) && (
                  <div className="selection-overlay" />
                )}

                <div
                  className={`relative transition-all duration-300 ${
                    selectionMode && selectedItems.has(media.id)
                      ? "transform scale-95 shadow-2xl"
                      : ""
                  }`}
                >
                  <MediaCard
                    media={media}
                    selectionMode={selectionMode}
                    onSelect={handleMediaSelect}
                    onToggleSelection={toggleItemSelection}
                  />
                </div>
              </div>
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

      {/* Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-2xl shadow-2xl z-50 backdrop-blur-xl border transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-500/90 text-white border-green-400/50"
              : notification.type === "error"
              ? "bg-red-500/90 text-white border-red-400/50"
              : "bg-blue-500/90 text-white border-blue-400/50"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {notification.type === "success" ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : notification.type === "error" ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <span className="text-sm font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="flex-shrink-0 ml-3 transition-colors text-white/80 hover:text-white"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
