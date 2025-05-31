import React, { useState } from "react";
import { tagsApi } from "@/services/api";

interface CreateTagFormProps {
  onTagCreated: (tagId: string) => void;
  onCancel: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onRefreshTags?: () => void;
}

export function CreateTagForm({
  onTagCreated,
  onCancel,
  loading,
  setLoading,
  onRefreshTags,
}: CreateTagFormProps) {
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6366F1");

  const commonColors = [
    "#6366F1", // Indigo
    "#8B5CF6", // Violet
    "#EC4899", // Pink
    "#EF4444", // Red
    "#F59E0B", // Amber
    "#10B981", // Emerald
    "#06B6D4", // Cyan
    "#3B82F6", // Blue
    "#84CC16", // Lime
    "#F97316", // Orange
    "#6B7280", // Gray
    "#1F2937", // Dark Gray
  ];

  const getContrastColor = (hexColor: string) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? "#000000" : "#ffffff";
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    setLoading(true);
    try {
      const createResponse = await tagsApi.createTag({
        name: newTagName.trim(),
        color: newTagColor,
      });

      if (createResponse.success && createResponse.data) {
        // Immediately add the new tag to the media
        await onTagCreated(createResponse.data.id);
        setNewTagName("");
        setNewTagColor("#6366F1");
        onCancel();
        // Refresh tags list
        onRefreshTags?.();
      }
    } catch (error) {
      console.error("Failed to create tag:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTagName.trim()) {
      handleCreateTag();
    } else if (e.key === "Escape") {
      onCancel();
      setNewTagName("");
    }
  };

  return (
    <div className="p-4 space-y-4 border rounded-lg border-border/50 bg-muted/20">
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Tag Name
          </label>
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Enter tag name..."
            className="w-full px-3 py-2 text-sm transition-all duration-200 border rounded-lg border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>

        <div>
          <label className="block mb-2 text-xs font-medium text-muted-foreground">
            Color
          </label>
          <div className="grid grid-cols-6 gap-1.5">
            {commonColors.map((color) => (
              <button
                key={color}
                onClick={() => setNewTagColor(color)}
                className={`relative w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 hover:shadow-md ${
                  newTagColor === color
                    ? "border-foreground ring-2 ring-primary/30 scale-105"
                    : "border-border/30 hover:border-border/60"
                }`}
                style={{ backgroundColor: color }}
                title={color}
              >
                {newTagColor === color && (
                  <svg
                    className="absolute inset-0 w-4 h-4 m-auto text-white drop-shadow-sm"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        {newTagName.trim() && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Preview:
            </span>
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full"
              style={{
                backgroundColor: newTagColor,
                color: getContrastColor(newTagColor),
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></div>
              <span>{newTagName.trim()}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={handleCreateTag}
          disabled={!newTagName.trim() || loading}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {loading ? (
            <>
              <svg
                className="w-3 h-3 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Creating...
            </>
          ) : (
            <>
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Create & Add
            </>
          )}
        </button>
        <button
          onClick={() => {
            onCancel();
            setNewTagName("");
            setNewTagColor("#6366F1");
          }}
          className="px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-secondary/20"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
