import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useTheme } from "../ThemeProvider";
import { ZoomIndicatorProps } from "./types";

export function ZoomIndicator({ scale, isVisible }: ZoomIndicatorProps) {
  const { theme } = useTheme();
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
      className={`
        absolute bottom-4 left-4 px-3 py-2 rounded-full text-sm font-medium
        ${
          theme === "dark"
            ? "bg-white/10 text-white backdrop-blur-md border border-white/20"
            : "bg-black/10 text-black backdrop-blur-md border border-black/20"
        }
      `}
    >
      {Math.round(scale * 100)}%
    </div>
  );
}
