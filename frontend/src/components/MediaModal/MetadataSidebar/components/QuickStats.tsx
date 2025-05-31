import React from "react";
import { MediaFile } from "@/types";

interface QuickStatsProps {
  media: MediaFile;
}

export function QuickStats({ media }: QuickStatsProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="p-3 border rounded-lg bg-card/30 border-border/30">
        <div className="text-xs font-medium text-muted-foreground">Size</div>
        <div className="mt-1 text-sm font-semibold text-foreground">
          {formatFileSize(media.fileSize)}
        </div>
      </div>
      <div className="p-3 border rounded-lg bg-card/30 border-border/30">
        <div className="text-xs font-medium text-muted-foreground">Type</div>
        <div className="mt-1 text-sm font-semibold text-foreground">
          {media.mimeType.split("/")[1]?.toUpperCase() || "UNKNOWN"}
        </div>
      </div>
      {media.width && media.height && (
        <>
          <div className="p-3 border rounded-lg bg-card/30 border-border/30">
            <div className="text-xs font-medium text-muted-foreground">
              Width
            </div>
            <div className="mt-1 text-sm font-semibold text-foreground">
              {media.width}px
            </div>
          </div>
          <div className="p-3 border rounded-lg bg-card/30 border-border/30">
            <div className="text-xs font-medium text-muted-foreground">
              Height
            </div>
            <div className="mt-1 text-sm font-semibold text-foreground">
              {media.height}px
            </div>
          </div>
        </>
      )}
    </div>
  );
}
