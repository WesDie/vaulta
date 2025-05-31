import React from "react";
import { MediaFile } from "@/types";

interface LocationDataProps {
  media: MediaFile;
}

export function LocationData({ media }: LocationDataProps) {
  if (!media.exifData?.gps) {
    return null;
  }

  return (
    <div className="p-4 transition-all duration-200 border rounded-xl bg-card/50 border-border/50 hover:bg-card/70 hover:border-border/70">
      <div className="flex items-center gap-2 mb-3">
        <svg
          className="w-4 h-4 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <h3 className="text-sm font-semibold text-foreground">Location</h3>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <div className="flex items-center justify-between p-2 rounded bg-muted/30">
          <span className="text-xs text-muted-foreground">Latitude:</span>
          <span className="font-mono text-sm font-medium text-foreground">
            {media.exifData.gps.latitude}
          </span>
        </div>
        <div className="flex items-center justify-between p-2 rounded bg-muted/30">
          <span className="text-xs text-muted-foreground">Longitude:</span>
          <span className="font-mono text-sm font-medium text-foreground">
            {media.exifData.gps.longitude}
          </span>
        </div>
      </div>
    </div>
  );
}
