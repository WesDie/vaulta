import React from "react";
import { Tag } from "@/types";

interface AvailableTagsProps {
  availableTags: Tag[];
  onAddTag: (tagId: string) => void;
  loading: boolean;
}

export function AvailableTags({
  availableTags,
  onAddTag,
  loading,
}: AvailableTagsProps) {
  const getContrastColor = (hexColor: string) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? "#000000" : "#ffffff";
  };

  if (availableTags.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
        Available Tags ({availableTags.length})
      </p>
      <div className="grid grid-cols-1 gap-1.5 max-h-32 overflow-y-auto">
        {availableTags.map((tag: Tag) => {
          const textColor = getContrastColor(tag.color || "#6366F1");
          return (
            <button
              key={tag.id}
              onClick={() => onAddTag(tag.id)}
              disabled={loading}
              className="flex items-center gap-2 p-2 text-sm font-medium text-left transition-all duration-200 border rounded-lg border-border/30 hover:border-primary/40 hover:bg-muted/30 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div
                className="flex-shrink-0 w-3 h-3 rounded-full ring-2 ring-white/20"
                style={{ backgroundColor: tag.color || "#6366F1" }}
              />
              <span className="flex-1 text-foreground group-hover:text-foreground">
                {tag.name}
              </span>
              <svg
                className="w-4 h-4 transition-colors text-muted-foreground group-hover:text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}
