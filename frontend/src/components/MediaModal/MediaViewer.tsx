import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { useZoom } from "./useZoom";
import { ZoomIndicator } from "./ZoomIndicator";
import { useProgressiveImageLoad } from "./useProgressiveImageLoad";

interface MediaViewerComponentProps {
  media: any;
  onHeightChange?: (height: number) => void;
  onResetTransform?: (resetFn: () => void) => void;
  preloadUrls?: { thumbnailUrl: string; fullImageUrl: string }[]; // For preloading adjacent images
}

export function MediaViewer({
  media,
  onHeightChange,
  onResetTransform,
  preloadUrls = [],
}: MediaViewerComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    transform,
    isDragging,
    resetTransform,
    handleMouseDown,
    handleTouchStart,
    handleTouchMove,
  } = useZoom({
    isOpen: true,
    media,
    containerRef,
  });

  const isImage = media?.mimeType?.startsWith("image/");
  const isVideo = media?.mimeType?.startsWith("video/");

  // Generate URLs for progressive loading
  const thumbnailUrl = `/api/media/${media?.id}/image?size=thumb`;
  const fullImageUrl = `/originals/${media?.filename}`;

  const { loadState, preloadImage, handleFullImageRender } =
    useProgressiveImageLoad({
      mediaId: media?.id || "",
      thumbnailUrl,
      fullImageUrl,
      priority: true,
    });

  // Track container height changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onHeightChange) return;

    const updateHeight = () => {
      const height = container.offsetHeight;
      onHeightChange(height);
    };

    // Initial height
    updateHeight();

    // Use ResizeObserver to track height changes
    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [onHeightChange]);

  // Pass reset function to parent
  useEffect(() => {
    if (onResetTransform) {
      onResetTransform(resetTransform);
    }
  }, [onResetTransform, resetTransform]);

  // Preload adjacent images for faster navigation
  useEffect(() => {
    preloadUrls.forEach(({ thumbnailUrl: thumbUrl, fullImageUrl: fullUrl }) => {
      preloadImage(thumbUrl);
      preloadImage(fullUrl);
    });
  }, [preloadUrls, preloadImage]);

  // Update height after images load
  useEffect(() => {
    if (loadState.thumbnailLoaded || loadState.fullImageLoaded) {
      setTimeout(() => {
        if (containerRef.current && onHeightChange) {
          onHeightChange(containerRef.current.offsetHeight);
        }
      }, 100);
    }
  }, [loadState.thumbnailLoaded, loadState.fullImageLoaded, onHeightChange]);

  return (
    <div
      ref={containerRef}
      className={`
        relative flex items-center justify-center flex-1 overflow-hidden h-full w-full
        ${isImage && transform.scale > 1 ? "cursor-grab" : "cursor-default"}
        ${isDragging ? "cursor-grabbing" : ""}
      `}
    >
      {isImage && (
        <>
          {/* Image container */}
          <div
            className="relative flex items-center justify-center h-full max-w-full max-h-full"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            style={{
              transform: `scale(${transform.scale}) translate(${transform.x}px, ${transform.y}px)`,
              transition: isDragging ? "none" : "transform 0.2s ease-out",
              cursor:
                transform.scale > 1
                  ? isDragging
                    ? "grabbing"
                    : "grab"
                  : "default",
            }}
          >
            {/* Show thumbnail first (unless we're showing full image first for cached content) */}
            {!loadState.showFullImageFirst && loadState.thumbnailLoaded && (
              <Image
                src={thumbnailUrl}
                alt={media.filename}
                width={media.width || 800}
                height={media.height || 600}
                className={`
                  object-contain max-w-full max-h-[100vh] select-none
                  transition-opacity duration-300
                  ${loadState.fullImageRendered ? "opacity-0" : "opacity-100"}
                `}
                draggable={false}
                priority
              />
            )}

            {/* Full resolution image */}
            {loadState.fullImageLoaded && (
              <Image
                src={fullImageUrl}
                alt={media.filename}
                width={media.width || 800}
                height={media.height || 600}
                className={`
                  ${
                    loadState.showFullImageFirst
                      ? ""
                      : "absolute my-auto inset-0"
                  } 
                  object-contain max-w-full max-h-[100vh] select-none 
                  transition-opacity duration-500
                  ${loadState.fullImageRendered ? "opacity-100" : "opacity-0"}
                `}
                onLoad={handleFullImageRender}
                draggable={false}
                priority
              />
            )}

            {/* Error state */}
            {loadState.error && (
              <div className="flex flex-col items-center gap-3 p-8 text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
                  <svg
                    className="w-8 h-8 text-destructive"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Failed to load image
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The image could not be loaded. Please try again.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quality indicator */}
          {!loadState.showFullImageFirst &&
            loadState.thumbnailLoaded &&
            !loadState.fullImageRendered &&
            !loadState.error && (
              <div className="absolute z-20 flex items-center px-3 py-2 text-xs border rounded-lg bottom-4 right-4 bg-background/80 backdrop-blur-sm border-border">
                <div className="w-2 h-2 mr-2 bg-yellow-500 rounded-full" />
                Preview Quality
              </div>
            )}

          {loadState.fullImageRendered && (
            <div className="absolute z-20 flex items-center px-3 py-2 text-xs border rounded-lg bottom-4 right-4 bg-background/80 backdrop-blur-sm border-border">
              <div className="w-2 h-2 mr-2 bg-green-500 rounded-full" />
              Full Quality
            </div>
          )}
        </>
      )}

      {isVideo && (
        <video
          src={fullImageUrl}
          controls
          className="max-w-full max-h-[100vh] rounded-none"
          onLoadedData={() => {
            // Update height after video loads
            setTimeout(() => {
              if (containerRef.current && onHeightChange) {
                onHeightChange(containerRef.current.offsetHeight);
              }
            }, 100);
          }}
        >
          Your browser does not support the video tag.
        </video>
      )}

      {/* Zoom indicator */}
      <ZoomIndicator
        scale={transform.scale}
        isVisible={isImage && transform.scale !== 1}
      />
    </div>
  );
}
