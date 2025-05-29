import { useState, useEffect, useRef, useCallback } from "react";
import { FileInfo } from "../types";
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from "../constants";

interface FileThumbnailProps {
  file: FileInfo;
  className?: string;
}

// Global thumbnail cache to avoid regenerating the same files
const thumbnailCache = new Map<string, string>();
// Global queue to limit concurrent thumbnail generation
let generationQueue: (() => Promise<void>)[] = [];
let isProcessingQueue = false;
const MAX_CONCURRENT_GENERATIONS = 3;

export function FileThumbnail({ file, className = "" }: FileThumbnailProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isImage = IMAGE_EXTENSIONS.includes(file.extension);
  const isVideo = VIDEO_EXTENSIONS.includes(file.extension);
  const cacheKey = `${file.path}_${file.size}_${file.type}`;

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px", // Start loading 50px before the element is visible
        threshold: 0.1,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessingQueue || generationQueue.length === 0) return;

    isProcessingQueue = true;

    while (generationQueue.length > 0) {
      const batch = generationQueue.splice(0, MAX_CONCURRENT_GENERATIONS);
      await Promise.allSettled(batch.map((fn) => fn()));

      // Small delay to prevent blocking the main thread
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    isProcessingQueue = false;
  }, []);

  const generateThumbnail = useCallback(async () => {
    if (!isVisible || (!isImage && !isVideo)) return;

    // Check cache first
    if (thumbnailCache.has(cacheKey)) {
      setThumbnailUrl(thumbnailCache.get(cacheKey)!);
      return;
    }

    setIsLoading(true);

    const generation = async () => {
      try {
        let url: string;

        if (isImage) {
          url = await generateImageThumbnail(file.file);
        } else {
          url = await extractVideoFrame(file.file);
        }

        // Cache the thumbnail
        thumbnailCache.set(cacheKey, url);
        setThumbnailUrl(url);
      } catch (err) {
        console.error("Error generating thumbnail:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    // Add to queue instead of processing immediately
    generationQueue.push(generation);
    processQueue();
  }, [isVisible, isImage, isVideo, cacheKey, file.file, processQueue]);

  useEffect(() => {
    generateThumbnail();
  }, [generateThumbnail]);

  const generateImageThumbnail = (imageFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      img.onload = () => {
        // Generate small thumbnail (64x64 max for 32x32 display with 2x pixel density)
        const maxSize = 64;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = Math.floor(img.width * ratio);
        canvas.height = Math.floor(img.height * ratio);

        // Use better quality settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve(url);
            } else {
              reject(new Error("Failed to create blob from canvas"));
            }
          },
          "image/jpeg",
          0.7 // Lower quality for smaller files
        );

        // Cleanup
        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => {
        reject(new Error("Error loading image"));
        URL.revokeObjectURL(img.src);
      };

      img.src = URL.createObjectURL(imageFile);
    });
  };

  const extractVideoFrame = (videoFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      video.addEventListener("loadedmetadata", () => {
        // Generate small thumbnail (64x64 max)
        const maxSize = 64;
        const ratio = Math.min(
          maxSize / video.videoWidth,
          maxSize / video.videoHeight
        );
        canvas.width = Math.floor(video.videoWidth * ratio);
        canvas.height = Math.floor(video.videoHeight * ratio);

        // Seek to a safe position (1 second or 10% of duration)
        const seekTime = Math.min(1, video.duration * 0.1);
        video.currentTime = seekTime;
      });

      video.addEventListener("seeked", () => {
        try {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                resolve(url);
              } else {
                reject(new Error("Failed to create blob from canvas"));
              }
            },
            "image/jpeg",
            0.7
          );
        } catch (err) {
          reject(err);
        } finally {
          // Cleanup
          URL.revokeObjectURL(video.src);
        }
      });

      video.addEventListener("error", () => {
        reject(new Error("Error loading video"));
        URL.revokeObjectURL(video.src);
      });

      // Load the video
      video.src = URL.createObjectURL(videoFile);
      video.load();
    });
  };

  // Cleanup function to revoke URLs when component unmounts
  useEffect(() => {
    return () => {
      if (thumbnailUrl && !thumbnailCache.has(cacheKey)) {
        URL.revokeObjectURL(thumbnailUrl);
      }
    };
  }, [thumbnailUrl, cacheKey]);

  // Fallback icons for non-media files or when thumbnail fails
  const getFallbackIcon = () => {
    if (isImage) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded bg-blue-500/10">
          <svg
            className="w-4 h-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      );
    }
    if (isVideo) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded bg-purple-500/10">
          <svg
            className="w-4 h-4 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded bg-muted">
        <svg
          className="w-4 h-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
    );
  };

  if (!isVisible) {
    // Show placeholder while not visible (for intersection observer)
    return (
      <div
        ref={containerRef}
        className={`w-8 h-8 rounded bg-muted/20 ${className}`}
      />
    );
  }

  if (isLoading) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-center w-8 h-8 bg-muted/50 rounded animate-pulse ${className}`}
      >
        <div className="w-3 h-3 rounded bg-muted-foreground/20"></div>
      </div>
    );
  }

  if (error || !thumbnailUrl || (!isImage && !isVideo)) {
    return (
      <div ref={containerRef} className={className}>
        {getFallbackIcon()}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-8 h-8 rounded overflow-hidden ${className}`}
    >
      <img
        src={thumbnailUrl}
        alt={`Thumbnail for ${file.name}`}
        className="object-cover w-full h-full"
        onError={() => setError(true)}
      />
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="flex items-center justify-center w-3 h-3 rounded-full bg-black/60">
            <svg
              className="w-1.5 h-1.5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
