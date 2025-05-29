"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { FileInfo, FolderUploadModalProps } from "./types";
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from "./constants";
import { useFileUpload } from "./hooks/useFileUpload";
import { FileSelectionArea } from "./components/FileSelectionArea";
import { FileTypePanel } from "./components/FileTypePanel";
import { FileListPanel } from "./components/FileListPanel";
import { UploadProgress } from "./components/UploadProgress";
import { CompletionSummary } from "./components/CompletionSummary";

export function FolderUploadModal({
  isOpen,
  onClose,
  onUploadComplete,
}: FolderUploadModalProps) {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectedExtensions, setSelectedExtensions] = useState<Set<string>>(
    new Set()
  );
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    uploading,
    uploadProgress,
    showCompletionSummary,
    uploadFiles,
    resetUploadState,
  } = useFileUpload();

  // GSAP animations for modal open/close
  useEffect(() => {
    const backdrop = backdropRef.current;
    const modal = modalRef.current;

    if (!backdrop || !modal) return;

    if (isOpen) {
      // Show animation
      gsap.set(backdrop, { opacity: 0 });
      gsap.set(modal, { scale: 0.8, opacity: 0 });

      gsap.to(backdrop, { opacity: 1, duration: 0.3, ease: "power2.out" });
      gsap.to(modal, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: "back.out(1.2)",
        delay: 0.1,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleFolderSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const fileList = event.target.files;
    if (!fileList) return;

    const mediaFiles: FileInfo[] = [];
    const extensions = new Set<string>();

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const extension = "." + file.name.split(".").pop()?.toLowerCase();

      // Only include media files
      if (
        IMAGE_EXTENSIONS.includes(extension) ||
        VIDEO_EXTENSIONS.includes(extension)
      ) {
        mediaFiles.push({
          path: file.webkitRelativePath || file.name,
          name: file.name,
          size: file.size,
          type: file.type,
          extension: extension,
          file: file,
        });
        extensions.add(extension);
      }
    }

    setFiles(mediaFiles);
    setSelectedExtensions(new Set(extensions)); // Select all by default
    setSelectedFiles(new Set(mediaFiles.map((f) => f.path))); // Select all files by default
  };

  const handleExtensionToggle = (extension: string, checked: boolean) => {
    const newSelectedExtensions = new Set(selectedExtensions);
    const newSelectedFiles = new Set(selectedFiles);

    if (checked) {
      newSelectedExtensions.add(extension);
      // Add all files with this extension
      files
        .filter((f) => f.extension === extension)
        .forEach((f) => {
          newSelectedFiles.add(f.path);
        });
    } else {
      newSelectedExtensions.delete(extension);
      // Remove all files with this extension
      files
        .filter((f) => f.extension === extension)
        .forEach((f) => {
          newSelectedFiles.delete(f.path);
        });
    }

    setSelectedExtensions(newSelectedExtensions);
    setSelectedFiles(newSelectedFiles);
  };

  const handleFileToggle = (filePath: string, checked: boolean) => {
    const newSelectedFiles = new Set(selectedFiles);
    if (checked) {
      newSelectedFiles.add(filePath);
    } else {
      newSelectedFiles.delete(filePath);
    }
    setSelectedFiles(newSelectedFiles);
  };

  const handleSelectAll = () => {
    setSelectedFiles(new Set(files.map((f) => f.path)));
    setSelectedExtensions(new Set(files.map((f) => f.extension)));
  };

  const handleDeselectAll = () => {
    setSelectedFiles(new Set());
    setSelectedExtensions(new Set());
  };

  const handleUpload = async () => {
    if (selectedFiles.size === 0) return;

    const filesToUpload = files.filter((fileInfo) =>
      selectedFiles.has(fileInfo.path)
    );

    await uploadFiles(filesToUpload, onUploadComplete);
  };

  const handleUploadMore = () => {
    setFiles([]);
    setSelectedFiles(new Set());
    setSelectedExtensions(new Set());
    resetUploadState();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 backdrop-blur-xl bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative z-[10000] w-full max-w-4xl max-h-[90vh] mx-4 bg-background/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-background/80">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Upload Folder
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Select a folder and choose which files to upload
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-2 transition-all duration-200 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <svg
              className="w-5 h-5"
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
          </button>
        </div>

        <div className="flex-1 overflow-hidden bg-background">
          {files.length === 0 ? (
            <FileSelectionArea onFolderSelect={handleFolderSelect} />
          ) : (
            /* File Management */
            <div className="flex h-[500px] bg-background">
              <FileTypePanel
                files={files}
                selectedFiles={selectedFiles}
                selectedExtensions={selectedExtensions}
                onExtensionToggle={handleExtensionToggle}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
              />
              <FileListPanel
                files={files}
                selectedFiles={selectedFiles}
                onFileToggle={handleFileToggle}
              />
            </div>
          )}
        </div>

        {/* Completion Summary Overlay */}
        {showCompletionSummary && (
          <div className="absolute inset-0 z-[10001] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl mx-4">
              <CompletionSummary
                uploadProgress={uploadProgress}
                onUploadMore={handleUploadMore}
                onClose={onClose}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        {files.length > 0 && (
          <div className="p-6 border-t border-border bg-muted/10">
            {uploading ? (
              <UploadProgress uploadProgress={uploadProgress} />
            ) : !showCompletionSummary ? (
              <div className="flex items-center justify-between">
                <button
                  onClick={handleUploadMore}
                  className="text-sm transition-colors text-muted-foreground hover:text-foreground"
                >
                  ← Choose Different Folder
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm transition-colors text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={selectedFiles.size === 0}
                    className="px-6 py-2 text-sm bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Upload {selectedFiles.size} Files
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );

  // Use portal to render outside of any parent container constraints
  if (typeof window !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return null;
}
