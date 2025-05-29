import { FileInfo } from "../types";
import { getFileTypeInfo, formatFileSize } from "../utils";

interface FileTypePanelProps {
  files: FileInfo[];
  selectedFiles: Set<string>;
  selectedExtensions: Set<string>;
  onExtensionToggle: (extension: string, checked: boolean) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function FileTypePanel({
  files,
  selectedFiles,
  selectedExtensions,
  onExtensionToggle,
  onSelectAll,
  onDeselectAll,
}: FileTypePanelProps) {
  const uniqueExtensions = Array.from(
    new Set(files.map((f) => f.extension))
  ).sort();

  const selectedFilesList = files.filter((f) => selectedFiles.has(f.path));

  return (
    <div className="p-6 border-r w-80 border-border bg-muted/20">
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 font-medium text-foreground">
            Filter by File Type
          </h3>

          {/* Quick Actions */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={onSelectAll}
              className="px-3 py-1.5 text-xs bg-accent hover:bg-accent/80 text-accent-foreground rounded-md transition-colors font-medium"
            >
              Select All Types
            </button>
            <button
              onClick={onDeselectAll}
              className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 text-muted-foreground rounded-md transition-colors font-medium"
            >
              Clear All
            </button>
          </div>

          {/* File Type Checkboxes */}
          <div className="space-y-2">
            {uniqueExtensions.map((extension) => {
              const count = files.filter(
                (f) => f.extension === extension
              ).length;
              const selectedCount = files.filter(
                (f) => f.extension === extension && selectedFiles.has(f.path)
              ).length;
              const typeInfo = getFileTypeInfo(extension);
              const isExtensionSelected = selectedExtensions.has(extension);

              return (
                <div
                  key={extension}
                  className={`flex items-center gap-3 p-3 transition-all duration-200 border rounded-lg cursor-pointer ${
                    isExtensionSelected
                      ? "border-accent/30 bg-accent/10 hover:bg-accent/15"
                      : "border-border hover:bg-accent/5 hover:border-accent/20"
                  }`}
                  onClick={() =>
                    onExtensionToggle(extension, !isExtensionSelected)
                  }
                >
                  {/* Custom styled checkbox */}
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isExtensionSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        onExtensionToggle(extension, e.target.checked);
                      }}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                        isExtensionSelected
                          ? "bg-accent border-accent text-accent-foreground"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      {isExtensionSelected && (
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center flex-1 gap-2">
                    <span className="text-sm">{typeInfo.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium border ${typeInfo.color}`}
                        >
                          {extension.toUpperCase()}
                        </span>
                        <span
                          className={`text-xs transition-colors ${
                            isExtensionSelected
                              ? "text-foreground font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {selectedCount > 0 ? `${selectedCount}/` : ""}
                          {count} file{count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Card */}
        <div className="p-4 border rounded-lg bg-background/50 border-border">
          <h4 className="mb-3 text-sm font-medium text-foreground">
            Selection Summary
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Selected Files</span>
              <span className="font-medium text-foreground">
                {selectedFiles.size} of {files.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Size</span>
              <span className="font-medium text-foreground">
                {formatFileSize(
                  selectedFilesList.reduce((sum, f) => sum + f.size, 0)
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">File Types</span>
              <span className="font-medium text-foreground">
                {selectedExtensions.size} of {uniqueExtensions.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
