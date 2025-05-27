import React, { useState, useRef } from "react";
import Image from "next/image";
import { useTheme } from "../ThemeProvider";
import { MediaViewerProps } from "./types";
import { useZoom } from "./useZoom";
import { ZoomIndicator } from "./ZoomIndicator";

interface MediaViewerComponentProps {
  media: any;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
}

export function MediaViewer({
  media,
  isLoading,
  onLoadingChange,
}: MediaViewerComponentProps) {
  const { theme } = useTheme();
  const [imageSize, setImageSize] = useState<"thumb" | "full">("thumb");
  const [fullImageLoaded, setFullImageLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    transform,
    isDragging,
    handleMouseDown,
    handleTouchStart,
    handleTouchMove,
  } = useZoom({
    isOpen: true,
    media,
    containerRef,
  });

  const optimizedImageUrl = `/api/media/${media.id}/image?size=thumb`;
  const originalUrl = `/originals/${media.filename}`;
  const isImage = media.mimeType.startsWith("image/");
  const isVideo = media.mimeType.startsWith("video/");

  const handleThumbnailLoad = () => {
    onLoadingChange(false);
    if (!fullImageLoaded) {
      setImageSize("full");
    }
  };

  const handleFullImageLoad = () => {
    setFullImageLoaded(true);
  };

  return (
    <div
      ref={containerRef}
      className={`
        relative flex items-center justify-center flex-1 overflow-hidden rounded-2xl
        ${isImage && transform.scale > 1 ? "cursor-grab" : "cursor-default"}
        ${isDragging ? "cursor-grabbing" : ""}
      `}
      style={{ minHeight: "60vh" }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`
              w-12 h-12 border-4 rounded-full animate-spin
              ${
                theme === "dark"
                  ? "border-white/20 border-t-white"
                  : "border-black/20 border-t-black"
              }
            `}
          />
        </div>
      )}

      {isImage && (
        <div
          className="relative flex items-center justify-center max-w-full max-h-full"
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
          {/* Thumbnail image */}
          {imageSize === "thumb" && (
            <Image
              src={optimizedImageUrl}
              alt={media.filename}
              width={media.width || 800}
              height={media.height || 600}
              className="object-contain max-w-full max-h-[80vh] select-none"
              onLoad={handleThumbnailLoad}
              onError={() => onLoadingChange(false)}
              priority
              draggable={false}
            />
          )}

          {/* Full resolution image */}
          {imageSize === "full" && (
            <Image
              src={originalUrl}
              alt={media.filename}
              width={media.width || 800}
              height={media.height || 600}
              className={`
                object-contain max-w-full max-h-[80vh] select-none
                transition-opacity duration-500
                ${fullImageLoaded ? "opacity-100" : "opacity-0"}
              `}
              onLoad={handleFullImageLoad}
              onError={() => setFullImageLoaded(true)}
              priority
              draggable={false}
            />
          )}

          {/* Show thumbnail behind full image until it loads */}
          {imageSize === "full" && !fullImageLoaded && (
            <Image
              src={optimizedImageUrl}
              alt={media.filename}
              width={media.width || 800}
              height={media.height || 600}
              className="absolute inset-0 object-contain max-w-full max-h-[80vh] select-none"
              style={{ zIndex: -1 }}
              draggable={false}
            />
          )}
        </div>
      )}

      {isVideo && (
        <video
          src={originalUrl}
          controls
          className="max-w-full max-h-[80vh] rounded-none"
          onLoadedData={() => onLoadingChange(false)}
          onError={() => onLoadingChange(false)}
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
