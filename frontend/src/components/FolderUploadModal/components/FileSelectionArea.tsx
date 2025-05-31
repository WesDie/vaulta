import { useRef, useState } from "react";
import { UploadMode } from "../types";

interface FileSelectionAreaProps {
  onFolderSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilesSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileSelectionArea({
  onFolderSelect,
  onFilesSelect,
}: FileSelectionAreaProps) {
  const folderInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);
  const [uploadMode, setUploadMode] = useState<UploadMode>("folder");

  const handleModeToggle = (mode: UploadMode) => {
    setUploadMode(mode);
  };

  const handleSelection = () => {
    if (uploadMode === "folder") {
      folderInputRef.current?.click();
    } else {
      filesInputRef.current?.click();
    }
  };

  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[400px] bg-background">
      {/* Hidden file inputs */}
      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory=""
        multiple
        onChange={onFolderSelect}
        className="hidden"
      />
      <input
        ref={filesInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={onFilesSelect}
        className="hidden"
      />

      {/* Mode Toggle */}
      <div className="flex items-center p-1 mb-6 rounded-lg bg-muted">
        <button
          onClick={() => handleModeToggle("folder")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            uploadMode === "folder"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:bg-accent"
          }`}
        >
          Upload Folder
        </button>
        <button
          onClick={() => handleModeToggle("files")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            uploadMode === "files"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:bg-accent"
          }`}
        >
          Upload Files
        </button>
      </div>

      {/* Selection Area */}
      <div
        onClick={handleSelection}
        className="max-w-md p-8 text-center transition-colors border-2 border-dashed cursor-pointer border-border rounded-xl hover:border-accent bg-muted/10 hover:bg-muted/20"
      >
        <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground">
          {uploadMode === "folder" ? (
            <svg
              className="w-full h-full"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5L12 5H5a2 2 0 00-2 2z"
              />
            </svg>
          ) : (
            <svg
              className="w-full h-full"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          )}
        </div>
        <h3 className="mb-2 text-lg font-medium text-foreground">
          {uploadMode === "folder" ? "Select a folder" : "Select files"}
        </h3>
        <p className="text-muted-foreground">
          {uploadMode === "folder"
            ? "Choose a folder containing images and videos to upload"
            : "Choose multiple individual images and multimedia files to upload"}
        </p>
      </div>
    </div>
  );
}
