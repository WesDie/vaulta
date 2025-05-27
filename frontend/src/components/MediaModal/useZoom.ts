import { useState, useCallback, useEffect, useRef } from "react";
import { ImageTransform } from "./types";

interface UseZoomProps {
  isOpen: boolean;
  media: any;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function useZoom({ isOpen, media, containerRef }: UseZoomProps) {
  const [transform, setTransform] = useState<ImageTransform>({
    scale: 1,
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const dragRef = useRef({ x: 0, y: 0 });

  // Calculate minimum scale based on container and image dimensions
  const getMinScale = useCallback(() => {
    if (!containerRef.current || !media?.width || !media?.height) return 1;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calculate scale to fit image in container
    const scaleX = containerWidth / media.width;
    const scaleY = containerHeight / media.height;
    const fitScale = Math.min(scaleX, scaleY);

    // Don't allow zooming out below 100% (1.0) or the fit scale, whichever is smaller
    return Math.max(1, fitScale);
  }, [containerRef, media]);

  const resetTransform = useCallback(() => {
    setTransform({ scale: 1, x: 0, y: 0 });
  }, []);

  // Reset transform when modal opens or media changes
  useEffect(() => {
    if (isOpen) {
      resetTransform();
    }
  }, [isOpen, media?.id, resetTransform]);

  // Constrain transform values
  const constrainTransform = useCallback(
    (newTransform: ImageTransform): ImageTransform => {
      const minScale = getMinScale();
      const maxScale = 20;

      let { scale, x, y } = newTransform;

      // Constrain scale
      scale = Math.min(Math.max(scale, minScale), maxScale);

      // Constrain pan based on scale and container size
      if (containerRef.current && media?.width && media?.height) {
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const scaledWidth = media.width * scale;
        const scaledHeight = media.height * scale;

        // Calculate maximum pan distance
        const maxX = Math.max(0, (scaledWidth - containerWidth) / 2);
        const maxY = Math.max(0, (scaledHeight - containerHeight) / 2);

        x = Math.min(Math.max(x, -maxX), maxX);
        y = Math.min(Math.max(y, -maxY), maxY);
      }

      return { scale, x, y };
    },
    [getMinScale, containerRef, media]
  );

  const updateTransform = useCallback(
    (
      newTransform: ImageTransform | ((prev: ImageTransform) => ImageTransform)
    ) => {
      setTransform((prev) => {
        const next =
          typeof newTransform === "function"
            ? newTransform(prev)
            : newTransform;
        return constrainTransform(next);
      });
    },
    [constrainTransform]
  );

  // Mouse wheel zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!isOpen || !media?.mimeType.startsWith("image/")) return;

      e.preventDefault();
      // Use multiplicative zoom for consistent zoom speed at all levels
      const zoomFactor = 1 + e.deltaY * -0.005;
      updateTransform((prev) => ({ ...prev, scale: prev.scale * zoomFactor }));
    },
    [isOpen, media, updateTransform]
  );

  // Mouse drag
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (transform.scale <= 1) return;

      setIsDragging(true);
      dragRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    },
    [transform]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      // Scale movement by inverse of current scale for consistent drag sensitivity
      const movementScale = 1 / transform.scale;
      const deltaX = (e.clientX - dragRef.current.x) * movementScale;
      const deltaY = (e.clientY - dragRef.current.y) * movementScale;

      const newX = transform.x + deltaX;
      const newY = transform.y + deltaY;

      // Update drag reference for next movement
      dragRef.current = { x: e.clientX, y: e.clientY };

      updateTransform((prev) => ({ ...prev, x: newX, y: newY }));
    },
    [isDragging, updateTransform, transform]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setLastTouchDistance(distance);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && lastTouchDistance > 0) {
        e.preventDefault();

        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );

        const scale = (distance / lastTouchDistance) * transform.scale;
        updateTransform((prev) => ({ ...prev, scale }));
        setLastTouchDistance(distance);
      }
    },
    [lastTouchDistance, transform.scale, updateTransform]
  );

  // Set up event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });

      return () => {
        container.removeEventListener("wheel", handleWheel);
      };
    }
  }, [handleWheel]);

  return {
    transform,
    isDragging,
    resetTransform,
    handleMouseDown,
    handleTouchStart,
    handleTouchMove,
    updateTransform,
    getMinScale,
  };
}
