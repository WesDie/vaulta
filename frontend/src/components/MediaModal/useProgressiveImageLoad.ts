import { useState, useEffect, useRef, useCallback } from "react";

export interface ImageLoadState {
  thumbnailLoaded: boolean;
  fullImageLoaded: boolean;
  fullImageRendered: boolean;
  loadingProgress: number;
  error: boolean;
  showFullImageFirst: boolean;
}

export interface UseProgressiveImageLoadOptions {
  mediaId: string;
  thumbnailUrl: string;
  fullImageUrl: string;
  priority?: boolean;
}

export function useProgressiveImageLoad({
  mediaId,
  thumbnailUrl,
  fullImageUrl,
  priority = false,
}: UseProgressiveImageLoadOptions) {
  const [loadState, setLoadState] = useState<ImageLoadState>({
    thumbnailLoaded: false,
    fullImageLoaded: false,
    fullImageRendered: false,
    loadingProgress: 0,
    error: false,
    showFullImageFirst: false,
  });

  const thumbnailRef = useRef<HTMLImageElement | null>(null);
  const fullImageRef = useRef<HTMLImageElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentMediaIdRef = useRef<string>("");
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cache for loaded images
  const imageCache = useRef<Map<string, boolean>>(new Map());

  const resetLoadState = useCallback(() => {
    setLoadState({
      thumbnailLoaded: false,
      fullImageLoaded: false,
      fullImageRendered: false,
      loadingProgress: 0,
      error: false,
      showFullImageFirst: false,
    });
  }, []);

  // Clear any ongoing timeouts and intervals
  const clearLoadingProcesses = useCallback(() => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Track when full image is rendered
  const handleFullImageRender = useCallback(() => {
    // Only update if this is still the current media
    if (currentMediaIdRef.current === mediaId) {
      setLoadState((prev) => ({
        ...prev,
        fullImageRendered: true,
      }));
    }
  }, [mediaId]);

  // Create image element and handle loading with abort support
  const loadImage = useCallback(
    (
      url: string,
      isFullImage: boolean = false,
      targetMediaId: string
    ): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        // Check if we should still be loading this image
        if (currentMediaIdRef.current !== targetMediaId) {
          reject(new Error("Navigation aborted"));
          return;
        }

        const img = new Image();

        if (isFullImage) {
          // Simulate loading progress for full images
          progressIntervalRef.current = setInterval(() => {
            // Check if we should still be loading this image
            if (currentMediaIdRef.current !== targetMediaId) {
              clearInterval(progressIntervalRef.current!);
              reject(new Error("Navigation aborted"));
              return;
            }

            setLoadState((prev) => {
              if (prev.fullImageLoaded || prev.loadingProgress >= 90) {
                clearInterval(progressIntervalRef.current!);
                progressIntervalRef.current = null;
                return prev;
              }
              return {
                ...prev,
                loadingProgress: Math.min(
                  prev.loadingProgress + Math.random() * 20,
                  90
                ),
              };
            });
          }, 100);

          img.onload = () => {
            // Check if this is still the current media
            if (currentMediaIdRef.current !== targetMediaId) {
              clearInterval(progressIntervalRef.current!);
              progressIntervalRef.current = null;
              reject(new Error("Navigation aborted"));
              return;
            }

            clearInterval(progressIntervalRef.current!);
            progressIntervalRef.current = null;
            setLoadState((prev) => ({
              ...prev,
              fullImageLoaded: true,
              loadingProgress: 100,
            }));
            imageCache.current.set(url, true);
            resolve(img);
          };

          img.onerror = () => {
            clearInterval(progressIntervalRef.current!);
            progressIntervalRef.current = null;

            // Only set error if this is still the current media
            if (currentMediaIdRef.current === targetMediaId) {
              setLoadState((prev) => ({
                ...prev,
                error: true,
                loadingProgress: 0,
              }));
            }
            reject(new Error(`Failed to load image: ${url}`));
          };
        } else {
          img.onload = () => {
            // Check if this is still the current media
            if (currentMediaIdRef.current !== targetMediaId) {
              reject(new Error("Navigation aborted"));
              return;
            }

            setLoadState((prev) => ({
              ...prev,
              thumbnailLoaded: true,
              loadingProgress: Math.max(prev.loadingProgress, 25),
            }));
            imageCache.current.set(url, true);
            resolve(img);
          };

          img.onerror = () => {
            // Only set error if this is still the current media
            if (currentMediaIdRef.current === targetMediaId) {
              setLoadState((prev) => ({
                ...prev,
                error: true,
              }));
            }
            reject(new Error(`Failed to load thumbnail: ${url}`));
          };
        }

        img.src = url;

        if (isFullImage) {
          fullImageRef.current = img;
        } else {
          thumbnailRef.current = img;
        }
      });
    },
    []
  );

  // Load images progressively with enhanced abort handling
  useEffect(() => {
    // Update current media ID reference
    currentMediaIdRef.current = mediaId;

    // Abort any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear any ongoing loading processes
    clearLoadingProcesses();

    abortControllerRef.current = new AbortController();
    resetLoadState();

    const loadImagesSequentially = async () => {
      try {
        // Double-check we're still on the same media
        if (currentMediaIdRef.current !== mediaId) {
          return;
        }

        // Check cache first
        const thumbnailCached = imageCache.current.get(thumbnailUrl);
        const fullImageCached = imageCache.current.get(fullImageUrl);

        // If full image is cached, skip thumbnail and show full image directly
        if (fullImageCached) {
          // Only update if we're still on the same media
          if (currentMediaIdRef.current === mediaId) {
            setLoadState((prev) => ({
              ...prev,
              showFullImageFirst: true,
              fullImageLoaded: true,
              fullImageRendered: true,
              loadingProgress: 100,
            }));
          }
          return;
        }

        // Load thumbnail first (only if full image is not cached)
        if (thumbnailCached) {
          if (currentMediaIdRef.current === mediaId) {
            setLoadState((prev) => ({
              ...prev,
              thumbnailLoaded: true,
              loadingProgress: 25,
            }));
          }
        } else {
          await loadImage(thumbnailUrl, false, mediaId);
        }

        // Check again before loading full image
        if (currentMediaIdRef.current !== mediaId) {
          return;
        }

        // Then load full resolution image
        await loadImage(fullImageUrl, true, mediaId);
      } catch (error) {
        // Only log errors for current media to avoid spam from aborted requests
        if (currentMediaIdRef.current === mediaId) {
          console.error("Error loading images:", error);
        }
      }
    };

    loadImagesSequentially();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      clearLoadingProcesses();
    };
  }, [
    mediaId,
    thumbnailUrl,
    fullImageUrl,
    loadImage,
    resetLoadState,
    clearLoadingProcesses,
  ]);

  // Preload next/previous images
  const preloadImage = useCallback((url: string) => {
    if (!imageCache.current.get(url)) {
      const img = new Image();
      img.onload = () => {
        imageCache.current.set(url, true);
      };
      img.src = url;
    }
  }, []);

  return {
    loadState,
    preloadImage,
    thumbnailRef,
    fullImageRef,
    handleFullImageRender,
  };
}
