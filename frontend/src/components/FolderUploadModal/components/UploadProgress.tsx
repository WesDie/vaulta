import { UploadProgressState } from "../types";

interface UploadProgressProps {
  uploadProgress: UploadProgressState;
}

export function UploadProgress({ uploadProgress }: UploadProgressProps) {
  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 border-2 rounded-full border-accent/30 border-t-accent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-foreground">
              {uploadProgress.stage === "uploading"
                ? "Uploading files..."
                : uploadProgress.stage === "processing"
                ? "Processing files..."
                : "Upload complete!"}
            </span>
            {uploadProgress.currentFileName && (
              <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                {uploadProgress.currentFileName}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium text-foreground">
            {uploadProgress.current} / {uploadProgress.total}
          </span>
          <p className="text-xs text-muted-foreground">
            {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
            complete
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full h-3 overflow-hidden rounded-full bg-muted/50">
          <div
            className="relative h-full overflow-hidden transition-all duration-500 ease-out rounded-full bg-gradient-to-r from-accent to-accent/80"
            style={{
              width: `${Math.max(
                2,
                (uploadProgress.current / uploadProgress.total) * 100
              )}%`,
            }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
            <div className="absolute top-0 right-0 w-4 h-full bg-white/30 animate-shimmer" />
          </div>
        </div>

        {/* Upload Stats */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            ✓ {uploadProgress.uploadedFiles.length} uploaded
          </span>
          {uploadProgress.failedFiles.length > 0 && (
            <span className="flex items-center gap-1 text-destructive">
              ✗ {uploadProgress.failedFiles.length} failed
            </span>
          )}
          <span>{uploadProgress.total - uploadProgress.current} remaining</span>
        </div>
      </div>

      {/* Recently Uploaded Files */}
      {uploadProgress.uploadedFiles.length > 0 && (
        <div className="overflow-y-auto max-h-20">
          <p className="mb-1 text-xs text-muted-foreground">
            Recently uploaded:
          </p>
          <div className="space-y-1">
            {uploadProgress.uploadedFiles.slice(-3).map((fileName, index) => (
              <div
                key={fileName}
                className="flex items-center gap-1 text-xs text-accent animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="w-1 h-1 rounded-full bg-accent" />
                <span className="truncate">{fileName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Messages */}
      {uploadProgress.failedFiles.length > 0 && (
        <div className="overflow-y-auto max-h-20">
          <p className="mb-1 text-xs text-destructive">Upload errors:</p>
          <div className="space-y-1">
            {uploadProgress.failedFiles.slice(-3).map((file, index) => (
              <div
                key={file.name}
                className="text-xs text-destructive/80 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="font-medium">{file.name}:</span> {file.error}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
