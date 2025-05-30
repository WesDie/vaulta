import { MediaFile } from "@/types";
import { MediaCard } from "../MediaCard";
import { ModernCheckbox } from "../ModernCheckbox";

interface ListViewProps {
  mediaFiles: MediaFile[];
  selectionMode: boolean;
  selectedItems: Set<string>;
  onMediaSelect: (media: MediaFile) => void;
  onToggleSelection: (id: string) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

export function ListView({
  mediaFiles,
  selectionMode,
  selectedItems,
  onMediaSelect,
  onToggleSelection,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: ListViewProps) {
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="w-full p-2 space-y-1">
        {mediaFiles.map((media) => (
          <div
            key={media.id}
            className={`media-item w-full ${
              selectionMode ? "selection-mode" : ""
            }`}
          >
            <div
              className={`flex items-center p-3 space-x-4 transition-all duration-300 rounded-lg cursor-pointer relative overflow-hidden w-full ${
                selectionMode && selectedItems.has(media.id)
                  ? "selection-list-bg"
                  : "bg-card hover:bg-card/80 shadow-sm hover:shadow-md"
              }`}
              onClick={() => onMediaSelect(media)}
            >
              {selectionMode && selectedItems.has(media.id) && (
                <div className="selection-list-glow" />
              )}

              {selectionMode && (
                <div className="z-10 flex-shrink-0">
                  <ModernCheckbox
                    checked={selectedItems.has(media.id)}
                    onChange={() => onToggleSelection(media.id)}
                    size="md"
                  />
                </div>
              )}

              <div className="flex-shrink-0 w-12 h-12 overflow-hidden rounded-lg">
                <MediaCard
                  media={media}
                  selectionMode={selectionMode}
                  onSelect={onMediaSelect}
                  onToggleSelection={onToggleSelection}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-card-foreground">
                  {media.filename}
                </p>
                <div className="flex items-center mt-1 space-x-4 text-xs text-muted-foreground">
                  <span className="font-medium">
                    {Math.round(media.fileSize / 1024)} KB
                  </span>
                  {media.width && media.height && (
                    <span>
                      {media.width} × {media.height}
                    </span>
                  )}
                </div>
              </div>
              {media.tags && media.tags.length > 0 && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-primary bg-accent rounded-full">
                    {media.tags.length} tag
                    {media.tags.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        {hasNextPage && (
          <div className="w-full p-4 text-center">
            <button
              onClick={onLoadMore}
              disabled={isFetchingNextPage}
              className="btn btn-secondary"
            >
              {isFetchingNextPage ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
