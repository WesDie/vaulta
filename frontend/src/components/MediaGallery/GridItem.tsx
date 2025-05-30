import { useEffect } from "react";
import { MediaFile } from "@/types";
import { MediaCard } from "../MediaCard";
import { ModernCheckbox } from "../ModernCheckbox";

export interface GridItemData {
  mediaFiles: MediaFile[];
  columnCount: number;
  itemSize: number;
  selectedMedia: MediaFile | null;
  selectionMode: boolean;
  selectedItems: Set<string>;
  onMediaSelect: (media: MediaFile) => void;
  onToggleSelection: (id: string) => void;
  onLoadMore: () => void;
  hasNextPage: boolean;
}

interface GridItemProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: GridItemData;
}

export function GridItem({
  columnIndex,
  rowIndex,
  style,
  data,
}: GridItemProps) {
  const {
    mediaFiles,
    columnCount,
    selectionMode,
    selectedItems,
    onMediaSelect,
    onToggleSelection,
    onLoadMore,
    hasNextPage,
  } = data;

  const index = rowIndex * columnCount + columnIndex;
  const media = mediaFiles[index];

  // Load more items when approaching the end
  useEffect(() => {
    if (index > mediaFiles.length - 20 && hasNextPage) {
      onLoadMore();
    }
  }, [index, mediaFiles.length, hasNextPage, onLoadMore]);

  if (!media) {
    // Show loading placeholder for empty slots
    return (
      <div
        style={{
          ...style,
          padding: "2px",
          boxSizing: "border-box",
        }}
      >
        <div className="w-full h-full rounded-lg bg-muted/20 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div
      style={{
        ...style,
        padding: "2px",
        boxSizing: "border-box",
      }}
      className="media-item"
    >
      {selectionMode ? (
        <div
          className={`relative group/selection h-full w-full ${
            selectedItems.has(media.id) ? "selection-overlay-active" : ""
          }`}
        >
          <div className="absolute z-20 top-2 left-2">
            <ModernCheckbox
              checked={selectedItems.has(media.id)}
              onChange={() => onToggleSelection(media.id)}
              size="md"
            />
          </div>
          {selectedItems.has(media.id) && <div className="selection-overlay" />}
          <div
            className={`relative transition-all duration-300 h-full w-full ${
              selectedItems.has(media.id) ? "transform scale-95 shadow-2xl" : ""
            }`}
          >
            <MediaCard
              media={media}
              selectionMode={selectionMode}
              onSelect={onMediaSelect}
              onToggleSelection={onToggleSelection}
            />
          </div>
        </div>
      ) : (
        <div className="w-full h-full">
          <MediaCard
            media={media}
            selectionMode={selectionMode}
            onSelect={onMediaSelect}
            onToggleSelection={onToggleSelection}
          />
        </div>
      )}
    </div>
  );
}
