import { UploadProgressState } from "../types";

interface CompletionSummaryProps {
  uploadProgress: UploadProgressState;
  onUploadMore: () => void;
  onClose: () => void;
}

export function CompletionSummary({
  uploadProgress,
  onUploadMore,
  onClose,
}: CompletionSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="p-6 border shadow-2xl rounded-2xl bg-background/95 backdrop-blur-xl border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10">
            {uploadProgress.failedFiles.length === 0 ? (
              <svg
                className="w-6 h-6 text-green-600"
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
            ) : uploadProgress.uploadedFiles.length > 0 ? (
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {uploadProgress.failedFiles.length === 0
                ? "Upload Completed Successfully!"
                : uploadProgress.uploadedFiles.length > 0
                ? "Upload Completed with Some Issues"
                : "Upload Failed"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {uploadProgress.failedFiles.length === 0
                ? "All files were uploaded successfully"
                : `${uploadProgress.uploadedFiles.length} files uploaded, ${uploadProgress.failedFiles.length} failed`}
            </p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-4 text-center border rounded-lg bg-muted/20 border-border">
            <div className="text-2xl font-bold text-foreground">
              {uploadProgress.total}
            </div>
            <div className="text-xs text-muted-foreground">Total Files</div>
          </div>
          <div className="p-4 text-center border border-green-200 rounded-lg bg-green-50 dark:bg-green-950/20 dark:border-green-800/30">
            <div className="text-2xl font-bold text-green-600">
              {uploadProgress.uploadedFiles.length}
            </div>
            <div className="text-xs text-green-600/80">Successful</div>
          </div>
          <div className="p-4 text-center border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20 dark:border-red-800/30">
            <div className="text-2xl font-bold text-red-600">
              {uploadProgress.failedFiles.length}
            </div>
            <div className="text-xs text-red-600/80">Failed</div>
          </div>
        </div>

        {/* Success Rate Bar */}
        <div className="mb-4">
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-muted-foreground">Success Rate</span>
            <span className="font-medium text-foreground">
              {Math.round(
                (uploadProgress.uploadedFiles.length / uploadProgress.total) *
                  100
              )}
              %
            </span>
          </div>
          <div className="w-full h-2 overflow-hidden rounded-full bg-muted/50">
            <div className="flex h-full overflow-hidden rounded-full">
              <div
                className="transition-all duration-1000 ease-out bg-green-500"
                style={{
                  width: `${
                    (uploadProgress.uploadedFiles.length /
                      uploadProgress.total) *
                    100
                  }%`,
                }}
              />
              <div
                className="transition-all duration-1000 ease-out bg-red-500"
                style={{
                  width: `${
                    (uploadProgress.failedFiles.length / uploadProgress.total) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Failed Files List */}
        {uploadProgress.failedFiles.length > 0 && (
          <div className="p-4 border rounded-lg bg-red-50/50 border-red-200/50 dark:bg-red-950/10 dark:border-red-800/20">
            <h4 className="mb-2 text-sm font-medium text-red-700 dark:text-red-400">
              Failed Files ({uploadProgress.failedFiles.length})
            </h4>
            <div className="space-y-1 overflow-y-auto max-h-32">
              {uploadProgress.failedFiles.map((file, index) => (
                <div key={index} className="text-xs">
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {file.name}
                  </span>
                  <span className="text-red-500/80 dark:text-red-400/60">
                    {" "}
                    - {file.error}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={onUploadMore}
            className="px-6 py-2 text-sm transition-all duration-200 border rounded-lg border-border text-muted-foreground hover:text-foreground hover:bg-accent/20 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Upload Another Folder
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
