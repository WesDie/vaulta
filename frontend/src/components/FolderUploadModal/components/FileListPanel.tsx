import { FileInfo } from "../types";
import { getFileTypeInfo, formatFileSize } from "../utils";
import { FileThumbnail } from "./FileThumbnail";
import { useState, useEffect, useRef, useMemo } from "react";

interface FileListPanelProps {
  files: FileInfo[];
  selectedFiles: Set<string>;
  onFileToggle: (filePath: string, checked: boolean) => void;
}

const ITEM_HEIGHT = 76; // Height of each file item in pixels
const OVERSCAN = 5; // Number of items to render outside viewport for smooth scrolling

export function FileListPanel({
  files,
  selectedFiles,
  onFileToggle,
}: FileListPanelProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const selectedFilesList = files.filter((f) => selectedFiles.has(f.path));

  // Calculate visible range for virtual scrolling
  const visibleRange = useMemo(() => {
    if (containerHeight === 0)
      return { start: 0, end: Math.min(20, files.length) };

    const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
    const visibleCount = Math.ceil(containerHeight / ITEM_HEIGHT);
    const end = Math.min(files.length, start + visibleCount + OVERSCAN * 2);

    return { start, end };
  }, [scrollTop, containerHeight, files.length]);

  // Update container height when component mounts or resizes
  useEffect(() => {
    const updateHeight = () => {
      if (scrollContainerRef.current) {
        setContainerHeight(scrollContainerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Only render visible items
  const visibleFiles = files.slice(visibleRange.start, visibleRange.end);
  const totalHeight = files.length * ITEM_HEIGHT;
  const offsetY = visibleRange.start * ITEM_HEIGHT;

  return (
    <div className="flex flex-col flex-1 p-6 bg-background">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-foreground">Files to Upload</h3>
        <span className="text-xs text-muted-foreground">
          {selectedFilesList.length} of {files.length} files selected
        </span>
      </div>

      <div
        ref={scrollContainerRef}
        className="h-full pr-2 overflow-y-auto"
        onScroll={handleScroll}
      >
        <div
          style={{ height: totalHeight, position: "relative" }}
          className="w-full"
        >
          <div
            style={{ transform: `translateY(${offsetY}px)` }}
            className="space-y-2"
          >
            {visibleFiles.map((file, index) => {
              const actualIndex = visibleRange.start + index;
              const typeInfo = getFileTypeInfo(file.extension);
              const isSelected = selectedFiles.has(file.path);

              return (
                <div
                  key={`${file.path}-${actualIndex}`} // Include index for better key stability
                  style={{ height: ITEM_HEIGHT }}
                  className={`flex items-center gap-3 p-3 transition-all duration-200 border rounded-lg border-border hover:bg-accent/30 cursor-pointer ${
                    isSelected
                      ? "bg-accent/10 border-accent/30"
                      : "opacity-50 hover:opacity-75"
                  }`}
                  onClick={() => onFileToggle(file.path, !isSelected)}
                >
                  {/* Custom styled checkbox */}
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        onFileToggle(file.path, e.target.checked);
                      }}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                        isSelected
                          ? "bg-accent border-accent text-accent-foreground"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      {isSelected && (
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

                  <FileThumbnail
                    file={file}
                    className={isSelected ? "" : "opacity-60"}
                  />

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {file.name}
                    </p>
                    <p className="text-xs truncate text-muted-foreground">
                      {file.path}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium border ${
                        typeInfo.color
                      } ${isSelected ? "" : "opacity-60"}`}
                    >
                      {file.extension.toUpperCase()}
                    </span>
                    <span className="min-w-0 text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
