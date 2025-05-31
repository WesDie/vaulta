import React from "react";
import { MediaFile } from "@/types";

interface CollectionsProps {
  media: MediaFile;
}

export function Collections({ media }: CollectionsProps) {
  if (!media.collections || media.collections.length === 0) {
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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <h3 className="text-sm font-semibold text-foreground">Collections</h3>
      </div>
      <div className="space-y-2">
        {media.collections.map((collection, index) => (
          <div
            key={index}
            className="px-3 py-2 text-sm font-medium border rounded-lg bg-primary/10 text-primary border-primary/20"
          >
            {collection.name}
          </div>
        ))}
      </div>
    </div>
  );
}
