import React from "react";
import { Tag as TagType } from "@/types";

interface TagProps {
  tag: TagType;
  variant?: "default" | "compact";
  removable?: boolean;
  onRemove?: (tagId: string) => void;
  onClick?: (tagId: string) => void;
  loading?: boolean;
  className?: string;
}

export function Tag({
  tag,
  variant = "default",
  removable = false,
  onRemove,
  onClick,
  loading = false,
  className = "",
}: TagProps) {
  const getContrastColor = (hexColor: string) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? "#1f2937" : "#f9fafb";
  };

  const baseColor = tag.color || "#6366F1";
  const textColor = getContrastColor(baseColor);

  // Create gradient and opacity styles
  const getModernStyles = () => {
    const rgb = {
      r: parseInt(baseColor.slice(1, 3), 16),
      g: parseInt(baseColor.slice(3, 5), 16),
      b: parseInt(baseColor.slice(5, 7), 16),
    };

    return {
      background: `linear-gradient(135deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15), rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08))`,
      borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
      boxShadow: `0 1px 3px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
    };
  };

  const modernStyles = getModernStyles();

  const handleClick = () => {
    if (onClick && !loading) {
      onClick(tag.id);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove && !loading) {
      onRemove(tag.id);
    }
  };

  if (variant === "compact") {
    return (
      <div
        className={`group relative inline-flex items-center justify-center w-6 h-6 rounded-full border transition-all duration-200 hover:scale-110 hover:shadow-lg backdrop-blur-sm cursor-pointer ${className}`}
        style={{
          ...modernStyles,
          color: textColor,
        }}
        onClick={handleClick}
        title={tag.name}
      >
        <div
          className="w-2 h-2 rounded-full opacity-70"
          style={{
            backgroundColor: baseColor,
            boxShadow: `0 0 4px rgba(${parseInt(
              baseColor.slice(1, 3),
              16
            )}, ${parseInt(baseColor.slice(3, 5), 16)}, ${parseInt(
              baseColor.slice(5, 7),
              16
            )}, 0.4)`,
          }}
        />

        {removable && (
          <button
            onClick={handleRemove}
            disabled={loading}
            className="absolute flex items-center justify-center w-4 h-4 text-xs font-bold text-white transition-all duration-200 rounded-full shadow-lg opacity-0 bg-gradient-to-br from-red-500 to-red-600 -top-1 -right-1 group-hover:opacity-100 hover:from-red-600 hover:to-red-700 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Remove tag"
          >
            ×
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`group flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border backdrop-blur-sm transition-all duration-200 ${
        onClick
          ? "cursor-pointer hover:scale-105 hover:shadow-lg hover:border-opacity-50"
          : ""
      } ${className}`}
      style={{
        ...modernStyles,
        color: textColor,
      }}
      onClick={handleClick}
    >
      <div
        className="w-1.5 h-1.5 rounded-full opacity-70"
        style={{
          backgroundColor: baseColor,
          boxShadow: `0 0 3px rgba(${parseInt(
            baseColor.slice(1, 3),
            16
          )}, ${parseInt(baseColor.slice(3, 5), 16)}, ${parseInt(
            baseColor.slice(5, 7),
            16
          )}, 0.5)`,
        }}
      ></div>
      <span className="font-medium text-foreground">{tag.name}</span>
      {removable && (
        <button
          onClick={handleRemove}
          disabled={loading}
          className="ml-1 p-0.5 text-foreground rounded-full transition-all duration-150 hover:bg-black/10 dark:hover:bg-white/10 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Remove tag"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

interface TagListProps {
  tags: TagType[];
  variant?: "default" | "compact";
  removable?: boolean;
  onRemove?: (tagId: string) => void;
  onClick?: (tagId: string) => void;
  loading?: boolean;
  className?: string;
  maxDisplay?: number;
}

export function TagList({
  tags,
  variant = "default",
  removable = false,
  onRemove,
  onClick,
  loading = false,
  className = "",
  maxDisplay,
}: TagListProps) {
  const displayTags = maxDisplay ? tags.slice(0, maxDisplay) : tags;
  const hiddenCount =
    maxDisplay && tags.length > maxDisplay ? tags.length - maxDisplay : 0;

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {displayTags.map((tag) => (
        <Tag
          key={tag.id}
          tag={tag}
          variant={variant}
          removable={removable}
          onRemove={onRemove}
          onClick={onClick}
          loading={loading}
        />
      ))}
      {hiddenCount > 0 && (
        <div className="flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
          +{hiddenCount}
        </div>
      )}
    </div>
  );
}
