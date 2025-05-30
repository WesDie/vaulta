"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { FixedSizeGrid as Grid } from "react-window";
import { FilterState, ViewMode, MediaFile } from "@/types";
import { useInfiniteMediaFiles } from "@/hooks/useMedia";
import { useSelection } from "@/hooks/useSelection";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useNotifications } from "@/hooks/useNotifications";
import { useMediaModal } from "@/hooks/useMediaModal";
import { getItemSize, getColumnsCount } from "@/utils/gridCalculations";
import { MediaModal } from "./MediaModal";
import { SelectionToolbar } from "./SelectionToolbar";
import { mediaApi } from "@/services/api";

// Extracted components
import { LoadingState } from "./MediaGallery/LoadingState";
import { ErrorState } from "./MediaGallery/ErrorState";
import { EmptyState } from "./MediaGallery/EmptyState";
import { NotificationToast } from "./MediaGallery/NotificationToast";
import { GridItem, type GridItemData } from "./MediaGallery/GridItem";
import { ListView } from "./MediaGallery/ListView";

interface MediaGalleryProps {
  filters: FilterState;
  viewMode: ViewMode;
}

export function MediaGallery({ filters, viewMode }: MediaGalleryProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0); // Start with 0 to force proper measurement
  const [containerHeight, setContainerHeight] = useState(0); // Start with 0 to force proper measurement

  const galleryRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<Grid | null>(null);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteMediaFiles(filters);

  // Flatten all pages into a single array
  const mediaFiles = useMemo(() => {
    if (!data) return [];
    return data.pages.reduce((acc, page) => {
      return [...acc, ...(page.data || [])];
    }, [] as MediaFile[]);
  }, [data]);

  const totalCount = data?.pages[0]?.pagination?.total || 0;

  // Custom hooks
  const {
    selectionMode,
    selectedItems,
    toggleItemSelection,
    selectAll,
    clearSelection,
    enterSelectionMode,
    exitSelectionMode,
  } = useSelection(mediaFiles);

  const { notification, showNotification, hideNotification } =
    useNotifications();

  const {
    selectedMedia,
    isModalOpen,
    openModal,
    closeModal,
    navigateToMedia,
    hasPrevious,
    hasNext,
  } = useMediaModal(mediaFiles);

  // Grid calculations
  const isListView = viewMode.type === "list";

  // Only calculate grid dimensions if we have container dimensions
  const columnCount = useMemo(() => {
    if (isListView || !containerWidth) return 1;
    return getColumnsCount(viewMode.size, containerWidth);
  }, [isListView, viewMode.size, containerWidth]);

  // Calculate actual item width to fill container completely with gaps
  const actualItemWidth = useMemo(() => {
    if (isListView || !containerWidth) return containerWidth || 0;
    const gap = 4; // 2px padding per side
    return Math.floor((containerWidth - gap * columnCount) / columnCount);
  }, [isListView, containerWidth, columnCount]);

  const itemSize = getItemSize(viewMode.size);

  // Add extra rows for loading placeholders
  const displayItemCount = mediaFiles.length + (hasNextPage ? 50 : 0);
  const rowCount = Math.ceil(displayItemCount / columnCount);

  // Improved dimension tracking with immediate measurement
  useEffect(() => {
    const updateDimensions = () => {
      if (galleryRef.current) {
        const rect = galleryRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setContainerWidth(rect.width);
          setContainerHeight(rect.height);
        }
      }
    };

    // Multiple strategies for initial measurement
    const measureInitial = () => {
      updateDimensions();
      // If still no dimensions, try a few more times
      if (containerWidth === 0 || containerHeight === 0) {
        requestAnimationFrame(updateDimensions);
        setTimeout(updateDimensions, 50);
        setTimeout(updateDimensions, 100);
      }
    };

    // Immediate update on mount
    measureInitial();

    // Use ResizeObserver for responsive changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerWidth(width);
          setContainerHeight(height);
        }
      }
    });

    // Use MutationObserver to detect DOM changes that might affect layout
    const mutationObserver = new MutationObserver(() => {
      // Delay to allow layout to settle
      setTimeout(updateDimensions, 50);
    });

    if (galleryRef.current) {
      resizeObserver.observe(galleryRef.current);
      // Watch for changes in the parent container that might indicate sidebar toggle
      const parentElement = galleryRef.current.parentElement;
      if (parentElement) {
        mutationObserver.observe(parentElement, {
          attributes: true,
          attributeFilter: ["class", "style"],
          subtree: true,
        });
      }
    }

    // Window resize and orientation change fallbacks
    const handleResize = () => {
      requestAnimationFrame(updateDimensions);
    };

    // Handle layout changes that might occur due to CSS transitions
    const handleTransitionEnd = () => {
      setTimeout(updateDimensions, 50);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    document.addEventListener("transitionend", handleTransitionEnd);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      document.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, []); // Remove containerWidth/containerHeight dependencies to avoid infinite loops

  // Additional effect to handle any prop changes that might affect layout
  useEffect(() => {
    const updateDimensions = () => {
      if (galleryRef.current) {
        const rect = galleryRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setContainerWidth(rect.width);
          setContainerHeight(rect.height);
        }
      }
    };

    // Delay to allow any layout changes to settle
    const timeoutId = setTimeout(updateDimensions, 150);
    return () => clearTimeout(timeoutId);
  }, [filters, viewMode]); // Trigger on filters or viewMode changes

  // Periodic dimension check to catch any missed layout changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (galleryRef.current) {
        const rect = galleryRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          // Only update if dimensions actually changed
          if (
            rect.width !== containerWidth ||
            rect.height !== containerHeight
          ) {
            setContainerWidth(rect.width);
            setContainerHeight(rect.height);
          }
        }
      }
    }, 500); // Check every 500ms

    return () => clearInterval(interval);
  }, [containerWidth, containerHeight]);

  // Force grid refresh when dimensions change
  useEffect(() => {
    if (gridRef.current && containerWidth > 0 && containerHeight > 0) {
      // Small delay to ensure the grid has the new dimensions
      setTimeout(() => {
        if (gridRef.current) {
          // Use type assertion since resetAfterIndex exists but may not be in TypeScript definitions
          (gridRef.current as any).resetAfterIndex?.(0);
        }
      }, 100);
    }
  }, [containerWidth, containerHeight]);

  // Bulk delete handler
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

        showNotification({ message, type: "success" });
        exitSelectionMode();
        window.location.reload();
      } else {
        throw new Error(response.error || "Bulk delete failed");
      }
    } catch (error) {
      console.error("Failed to bulk delete media:", error);
      showNotification({
        message: "Failed to delete selected items. Please try again.",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    selectionMode,
    selectedItemsCount: selectedItems.size,
    mediaFilesLength: mediaFiles.length,
    enterSelectionMode,
    exitSelectionMode,
    selectAll,
    onBulkDelete: handleBulkDelete,
  });

  const handleMediaSelect = (media: MediaFile) => {
    if (selectionMode) {
      toggleItemSelection(media.id);
    } else {
      openModal(media);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      await mediaApi.deleteMedia(mediaId);
      closeModal();
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete media:", error);
    }
  };

  // Load more items
  const handleLoadMore = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Scroll-based infinite loading for virtual grid
  const lastScrollLogRef = useRef(0);
  const handleGridScroll = useCallback(
    ({ scrollTop, scrollHeight, clientHeight }: any) => {
      // Trigger loading when user scrolls to within 200px of the bottom
      const threshold = 200;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      if (
        distanceFromBottom < threshold &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        handleLoadMore();
      }
    },
    [hasNextPage, isFetchingNextPage, handleLoadMore, mediaFiles.length]
  );

  // Alternative infinite loading using onItemsRendered
  const handleItemsRendered = useCallback(
    ({ visibleRowStartIndex, visibleRowStopIndex }: any) => {
      const totalRows = rowCount;
      const threshold = 5; // Load more when within 5 rows of the end

      if (
        visibleRowStopIndex >= totalRows - threshold &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        handleLoadMore();
      }
    },
    [rowCount, hasNextPage, isFetchingNextPage, handleLoadMore]
  );

  // Early returns for different states
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  if (mediaFiles.length === 0) {
    return <EmptyState filters={filters} />;
  }

  const gridItemData: GridItemData = {
    mediaFiles,
    columnCount,
    itemSize: actualItemWidth,
    selectedMedia,
    selectionMode,
    selectedItems,
    onMediaSelect: handleMediaSelect,
    onToggleSelection: toggleItemSelection,
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Selection toolbar */}
      {selectionMode ? (
        <div className="flex-shrink-0 px-4 py-2">
          <SelectionToolbar
            selectedCount={selectedItems.size}
            totalCount={mediaFiles.length}
            onSelectAll={selectAll}
            onClearSelection={clearSelection}
            onBulkDelete={handleBulkDelete}
            onExitSelection={exitSelectionMode}
            isDeleting={isDeleting}
          />
        </div>
      ) : (
        /* Results info */
        <div className="flex items-center justify-between flex-shrink-0 px-4 py-2 border-b">
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-muted-foreground">
              {mediaFiles.length} of {totalCount}{" "}
              {totalCount === 1 ? "item" : "items"}
              {isFetchingNextPage && " (loading...)"}
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
          <div className="flex items-center space-x-3">
            <div className="px-3 py-1 font-mono text-xs rounded-lg text-muted-foreground bg-muted">
              {(() => {
                const sortLabels: Record<
                  string,
                  { label: string; icon: string }
                > = {
                  dateTaken: { label: "Photo Date", icon: "📷" },
                  createdAt: { label: "Upload Date", icon: "📤" },
                  filename: { label: "Name", icon: "📄" },
                  fileSize: { label: "Size", icon: "💾" },
                };
                const currentSort = sortLabels[filters.sortBy] || {
                  label: filters.sortBy,
                  icon: "📋",
                };
                return `${currentSort.icon} ${currentSort.label} ${
                  filters.sortOrder === "desc" ? "↓" : "↑"
                }`;
              })()}
            </div>
            <div className="px-3 py-1 font-mono text-xs rounded-lg text-muted-foreground bg-muted">
              {viewMode.type.toUpperCase()} • {viewMode.size.toUpperCase()}
            </div>
          </div>
        </div>
      )}

      {/* Virtual scrolling grid or list view */}
      <div
        ref={galleryRef}
        className="relative flex-1 w-full h-full overflow-hidden"
      >
        {isListView ? (
          <ListView
            mediaFiles={mediaFiles}
            selectionMode={selectionMode}
            selectedItems={selectedItems}
            onMediaSelect={handleMediaSelect}
            onToggleSelection={toggleItemSelection}
            hasNextPage={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={handleLoadMore}
          />
        ) : (
          // Virtual grid for optimal performance with absolute positioning
          <div className="absolute inset-0">
            {containerWidth > 0 && containerHeight > 0 ? (
              <Grid
                ref={gridRef}
                columnCount={columnCount}
                columnWidth={actualItemWidth}
                height={containerHeight}
                rowCount={rowCount}
                rowHeight={itemSize}
                width={containerWidth}
                itemData={gridItemData}
                style={{ overflowX: "hidden", overflowY: "auto" }}
                onScroll={handleGridScroll}
                onItemsRendered={handleItemsRendered}
              >
                {GridItem}
              </Grid>
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
              </div>
            )}
          </div>
        )}
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
        <NotificationToast
          notification={notification}
          onDismiss={hideNotification}
        />
      )}
    </div>
  );
}
