"use client";

import { useState } from "react";
import { api } from "@/services/api";
import { UploadModal } from "./FolderUploadModal";

interface UploadButtonProps {
  onUploadComplete?: () => void;
}

export function UploadButton({ onUploadComplete }: UploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleScanDirectory = async () => {
    setUploading(true);

    try {
      const response = await api.post("/api/media/scan");
      console.log("Scan result:", response.data);
      onUploadComplete?.();
      alert(`Scan completed! Added ${response.data.data.added} new files.`);
    } catch (error) {
      console.error("Scan failed:", error);
      alert("Directory scan failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleUploadComplete = (result: {
    uploaded: number;
    skipped: number;
  }) => {
    onUploadComplete?.();

    let message = `Upload completed! `;

    if (result.uploaded > 0) {
      message += `${result.uploaded} file${
        result.uploaded === 1 ? "" : "s"
      } uploaded successfully.`;
    }

    if (result.skipped > 0) {
      message += ` ${result.skipped} file${result.skipped === 1 ? "" : "s"} ${
        result.uploaded > 0 ? "were" : "was"
      } skipped${result.uploaded > 0 ? "" : " or failed"}.`;
    }

    if (result.uploaded === 0 && result.skipped === 0) {
      message =
        "No files were processed. Please check your selection and try again.";
    }

    // Show a success toast instead of alert for better UX
    console.log("Upload result:", message);

    // Completion summary is now handled by the modal itself
    // No need for alert since the modal shows a comprehensive summary
  };

  const buttonBaseClasses =
    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]";

  return (
    <>
      <div className="flex gap-3">
        <button
          onClick={() => setShowUploadModal(true)}
          disabled={uploading}
          className={`${buttonBaseClasses} bg-accent hover:bg-accent/90 text-accent-foreground`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Upload Media
        </button>

        <button
          onClick={handleScanDirectory}
          disabled={uploading}
          className={`${buttonBaseClasses} bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border`}
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 rounded-full border-muted-foreground border-t-transparent animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Scan Directory
            </>
          )}
        </button>
      </div>

      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={handleUploadComplete}
      />
    </>
  );
}
