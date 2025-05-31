import React from "react";
import { MediaFile } from "@/types";

interface DownloadSectionProps {
  media: MediaFile;
}

export function DownloadSection({ media }: DownloadSectionProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const originalUrl = `/originals/${media.filename}`;

  return (
    <div className="p-4 transition-all duration-200 border rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 hover:from-primary/10 hover:to-primary/20">
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
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="text-sm font-semibold text-foreground">Download</h3>
      </div>
      <a
        href={originalUrl}
        download={media.filename}
        className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 group"
      >
        <svg
          className="w-4 h-4 mr-2 transition-transform group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Download Original
        <div className="ml-2 text-xs opacity-75">
          {formatFileSize(media.fileSize)}
        </div>
      </a>
    </div>
  );
}
