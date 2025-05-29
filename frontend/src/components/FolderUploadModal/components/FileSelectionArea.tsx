import { useRef } from "react";

interface FileSelectionAreaProps {
  onFolderSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileSelectionArea({ onFolderSelect }: FileSelectionAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-8 flex items-center justify-center min-h-[400px] bg-background">
      <input
        ref={fileInputRef}
        type="file"
        webkitdirectory=""
        multiple
        onChange={onFolderSelect}
        className="hidden"
      />
      <div
        onClick={() => fileInputRef.current?.click()}
        className="max-w-md p-8 text-center transition-colors border-2 border-dashed cursor-pointer border-border rounded-xl hover:border-accent bg-muted/10 hover:bg-muted/20"
      >
        <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground">
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
        </div>
        <h3 className="mb-2 text-lg font-medium text-foreground">
          Select a folder
        </h3>
        <p className="text-muted-foreground">
          Choose a folder containing images and videos to upload
        </p>
      </div>
    </div>
  );
}
