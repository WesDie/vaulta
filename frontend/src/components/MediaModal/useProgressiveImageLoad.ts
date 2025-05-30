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

  // Track when full image is rendered
  const handleFullImageRender = useCallback(() => {
    setLoadState((prev) => ({
      ...prev,
      fullImageRendered: true,
    }));
  }, []);

  // Create image element and handle loading
  const loadImage = useCallback(
    (url: string, isFullImage: boolean = false): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();

        if (isFullImage) {
          // Simulate loading progress for full images
          const progressInterval = setInterval(() => {
            setLoadState((prev) => {
              if (prev.fullImageLoaded || prev.loadingProgress >= 90) {
                clearInterval(progressInterval);
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
            clearInterval(progressInterval);
            setLoadState((prev) => ({
              ...prev,
              fullImageLoaded: true,
              loadingProgress: 100,
            }));
            imageCache.current.set(url, true);
            resolve(img);
          };

          img.onerror = () => {
            clearInterval(progressInterval);
            setLoadState((prev) => ({
              ...prev,
              error: true,
              loadingProgress: 0,
            }));
            reject(new Error(`Failed to load image: ${url}`));
          };
        } else {
          img.onload = () => {
            setLoadState((prev) => ({
              ...prev,
              thumbnailLoaded: true,
              loadingProgress: Math.max(prev.loadingProgress, 25),
            }));
            imageCache.current.set(url, true);
            resolve(img);
          };

          img.onerror = () => {
            setLoadState((prev) => ({
              ...prev,
              error: true,
            }));
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

  // Load images progressively
  useEffect(() => {
    // Abort any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    resetLoadState();

    const loadImagesSequentially = async () => {
      try {
        // Check cache first
        const thumbnailCached = imageCache.current.get(thumbnailUrl);
        const fullImageCached = imageCache.current.get(fullImageUrl);

        // If full image is cached, skip thumbnail and show full image directly
        if (fullImageCached) {
          setLoadState((prev) => ({
            ...prev,
            showFullImageFirst: true,
            fullImageLoaded: true,
            fullImageRendered: true,
            loadingProgress: 100,
          }));
          return;
        }

        // Load thumbnail first (only if full image is not cached)
        if (thumbnailCached) {
          setLoadState((prev) => ({
            ...prev,
            thumbnailLoaded: true,
            loadingProgress: 25,
          }));
        } else {
          await loadImage(thumbnailUrl, false);
        }

        // Then load full resolution image
        await loadImage(fullImageUrl, true);
      } catch (error) {
        console.error("Error loading images:", error);
      }
    };

    loadImagesSequentially();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [mediaId, thumbnailUrl, fullImageUrl, loadImage, resetLoadState]);

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
