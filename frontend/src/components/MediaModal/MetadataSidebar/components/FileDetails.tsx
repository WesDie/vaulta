import React from "react";
import { MediaFile } from "@/types";

interface FileDetailsProps {
  media: MediaFile;
}

export function FileDetails({ media }: FileDetailsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 transition-all duration-200 border rounded-xl bg-card/50 border-border/50 hover:bg-card/70 hover:border-border/70">
      <div className="flex items-center gap-2 mb-4">
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
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-sm font-semibold text-foreground">File Details</h3>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground">MIME Type:</span>
          <span className="font-medium text-foreground px-2 py-0.5 rounded bg-muted/50 text-xs">
            {media.mimeType}
          </span>
        </div>
        {media.width && media.height && (
          <div className="flex items-center justify-between py-1">
            <span className="text-muted-foreground">Dimensions:</span>
            <span className="font-medium text-foreground">
              {media.width} × {media.height}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground">Created:</span>
          <span className="text-xs font-medium text-foreground">
            {formatDate(media.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
