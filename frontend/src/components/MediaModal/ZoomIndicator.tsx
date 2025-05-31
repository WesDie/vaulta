import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ZoomIndicatorProps } from "./types";

export function ZoomIndicator({ scale, isVisible }: ZoomIndicatorProps) {
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const indicator = indicatorRef.current;
    if (!indicator) return;

    if (isVisible) {
      gsap.to(indicator, {
        scale: 1,
        opacity: 1,
        duration: 0.2,
        ease: "power2.out",
      });
    } else {
      gsap.to(indicator, {
        scale: 0.8,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
      });
    }
  }, [isVisible]);

  return (
    <div
      ref={indicatorRef}
      className="absolute px-3 py-2 text-sm font-medium border rounded-full shadow-sm bottom-20 left-4 bg-background/80 text-foreground backdrop-blur-md border-border"
    >
      {Math.round(scale * 100)}%
    </div>
  );
}
