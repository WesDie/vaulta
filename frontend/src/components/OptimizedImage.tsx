"use client";

import React, { useState, useRef, useEffect, useMemo, forwardRef } from "react";
import Image from "next/image";
import { decode } from "blurhash";
import { MediaFile } from "@/types";

export interface OptimizedImageProps {
  media: MediaFile;
  size?: "micro" | "small" | "medium" | "large";
  className?: string;
  alt?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
  fill?: boolean;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
}

// Custom hook for blur hash canvas generation
function useBlurHashCanvas(
  blurHash: string | undefined,
  width: number,
  height: number
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [blurDataUrl, setBlurDataUrl] = useState<string>("");

  useEffect(() => {
    if (!blurHash || !canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Decode blur hash
      const pixels = decode(blurHash, width, height);

      // Create ImageData and put pixels
      const imageData = ctx.createImageData(width, height);
      imageData.data.set(pixels);
      ctx.putImageData(imageData, 0, 0);

      // Convert to data URL for use as placeholder
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      setBlurDataUrl(dataUrl);
    } catch (error) {
      console.warn("Failed to decode blur hash:", error);
    }
  }, [blurHash, width, height]);

  return { canvasRef, blurDataUrl };
}

export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  function OptimizedImage(
    {
      media,
      size = "large",
      className = "",
      alt,
      priority = false,
      onLoad,
      onError,
      style,
      fill = false,
      width,
      height,
      loading = "lazy",
      ...props
    },
    ref
  ) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showBlurTransition, setShowBlurTransition] = useState(true);

    // Calculate blur hash canvas size (small for performance)
    const blurSize = useMemo(() => {
      const aspectRatio =
        media.width && media.height ? media.width / media.height : 1;
      const blurWidth = 32;
      const blurHeight = Math.round(blurWidth / aspectRatio);
      return { width: blurWidth, height: blurHeight };
    }, [media.width, media.height]);

    const { canvasRef, blurDataUrl } = useBlurHashCanvas(
      media.blurHash,
      blurSize.width,
      blurSize.height
    );

    // Generate optimized image URL
    const optimizedImageUrl = useMemo(() => {
      return `/api/media/${media.id}/image?size=${size}`;
    }, [media.id, size]);

    // Handle successful image load
    const handleImageLoad = () => {
      setImageLoaded(true);
      // Small delay before hiding blur for smooth transition
      setTimeout(() => setShowBlurTransition(false), 100);
      onLoad?.();
    };

    // Handle image error
    const handleImageError = () => {
      setImageError(true);
      setShowBlurTransition(false);
      onError?.();
    };

    // Determine image dimensions
    const imageDimensions = useMemo(() => {
      if (fill) return {};
      if (width && height) return { width, height };

      // Use media dimensions with max constraints based on size
      const maxDimensions = {
        micro: { maxWidth: 20, maxHeight: 20 },
        small: { maxWidth: 200, maxHeight: 200 },
        medium: { maxWidth: 400, maxHeight: 400 },
        large: { maxWidth: 800, maxHeight: 800 },
      };

      const max = maxDimensions[size];
      const mediaWidth = media.width || max.maxWidth;
      const mediaHeight = media.height || max.maxHeight;

      // Calculate scaled dimensions maintaining aspect ratio
      const aspectRatio = mediaWidth / mediaHeight;
      let scaledWidth = Math.min(mediaWidth, max.maxWidth);
      let scaledHeight = scaledWidth / aspectRatio;

      if (scaledHeight > max.maxHeight) {
        scaledHeight = max.maxHeight;
        scaledWidth = scaledHeight * aspectRatio;
      }

      return {
        width: Math.round(scaledWidth),
        height: Math.round(scaledHeight),
      };
    }, [fill, width, height, size, media.width, media.height]);

    // Sizes for responsive images
    const sizes = useMemo(() => {
      const sizeMap = {
        micro: "20px",
        small: "(max-width: 640px) 50vw, 200px",
        medium: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px",
        large: "(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px",
      };
      return sizeMap[size];
    }, [size]);

    return (
      <div
        className={`relative h-full overflow-hidden ${className}`}
        style={style}
        {...props}
      >
        {/* Hidden canvas for blur hash generation */}
        <canvas
          ref={canvasRef}
          style={{ display: "none" }}
          aria-hidden="true"
        />

        {/* Blur placeholder background */}
        {blurDataUrl && showBlurTransition && (
          <div
            className="absolute inset-0 transition-opacity duration-300 bg-center bg-cover"
            style={{
              backgroundImage: `url(${blurDataUrl})`,
              filter: "blur(2px)",
              transform: "scale(1.1)", // Slightly larger to hide blur edges
              opacity: imageLoaded ? 0 : 1,
            }}
            aria-hidden="true"
          />
        )}

        {/* Fallback solid color if no blur hash */}
        {!blurDataUrl && !imageLoaded && (
          <div
            className="absolute inset-0 bg-muted animate-pulse"
            aria-hidden="true"
          />
        )}

        {/* Main image */}
        {!imageError && (
          <Image
            ref={ref}
            src={optimizedImageUrl}
            alt={alt || media.filename}
            className={`transition-opacity duration-300 object-cover ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            priority={priority}
            loading={priority ? "eager" : loading}
            sizes={sizes}
            quality={size === "micro" ? 60 : 85}
            {...(fill ? { fill: true } : imageDimensions)}
          />
        )}

        {/* Error state */}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
            <div className="text-center">
              <svg
                className="w-8 h-8 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <p className="text-xs">Failed to load</p>
            </div>
          </div>
        )}

        {/* Loading state overlay for critical images */}
        {priority && !imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 rounded-full border-primary border-t-transparent animate-spin" />
          </div>
        )}
      </div>
    );
  }
);

export default OptimizedImage;
