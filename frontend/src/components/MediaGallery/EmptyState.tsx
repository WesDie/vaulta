import { FilterState } from "@/types";

interface EmptyStateProps {
  filters: FilterState;
}

export function EmptyState({ filters }: EmptyStateProps) {
  const hasFilters =
    filters.search || filters.selectedTags.length > 0 || filters.mimeType;

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
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-medium text-primary">
          {hasFilters ? "No matches found" : "No media yet"}
        </h3>
        <p className="text-muted-foreground">
          {hasFilters
            ? "Try adjusting your search criteria."
            : "Start by uploading some images or videos."}
        </p>
      </div>
    </div>
  );
}
