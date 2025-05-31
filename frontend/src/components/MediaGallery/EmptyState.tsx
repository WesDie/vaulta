import { FilterState } from "@/types";

interface EmptyStateProps {
  filters: FilterState;
}

export function EmptyState({ filters }: EmptyStateProps) {
  const hasFilters =
    filters.selectedTags.length > 0 ||
    filters.mimeType ||
    filters.camera ||
    filters.lens ||
    filters.focalLengthMin !== null ||
    filters.focalLengthMax !== null ||
    filters.apertureMin !== null ||
    filters.apertureMax !== null ||
    filters.isoMin !== null ||
    filters.isoMax !== null;

  const isPhotoDateSort = filters.sortBy === "dateTaken";

  return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground">
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            className="w-full h-full"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002 2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-medium text-primary">
          {hasFilters ? "No matches found" : "No media yet"}
        </h3>
        <p className="mb-4 text-muted-foreground">
          {hasFilters
            ? "Try adjusting your search criteria."
            : "Start by uploading some images or videos."}
        </p>

        {isPhotoDateSort && !hasFilters && (
          <div className="p-3 mt-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
              <span className="text-lg">📷</span>
              <div className="text-sm text-left">
                <p className="font-medium">Sorting by Photo Date</p>
                <p className="text-xs opacity-80">
                  Images will be sorted by when they were taken (EXIF data).
                  Upload images to see them organized by their capture date.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
