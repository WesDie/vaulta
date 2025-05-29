import { useState } from "react";
import { api } from "@/services/api";
import { FileInfo, UploadProgressState } from "../types";

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressState>({
    current: 0,
    total: 0,
    uploadedFiles: [],
    failedFiles: [],
    stage: "uploading",
  });
  const [showCompletionSummary, setShowCompletionSummary] = useState(false);

  const uploadFiles = async (
    filesToUpload: FileInfo[],
    onUploadComplete?: (result: { uploaded: number; skipped: number }) => void
  ) => {
    setUploading(true);
    setUploadProgress({
      current: 0,
      total: filesToUpload.length,
      uploadedFiles: [],
      failedFiles: [],
      stage: "uploading",
    });

    try {
      let uploaded = 0;
      let skipped = 0;
      const uploadedFiles: string[] = [];
      const failedFiles: { name: string; error: string }[] = [];

      // Upload files one by one for better progress tracking
      for (let i = 0; i < filesToUpload.length; i++) {
        const fileInfo = filesToUpload[i];
        const fileName = fileInfo.path;

        setUploadProgress((prev) => ({
          ...prev,
          current: i,
          currentFileName: fileName,
          stage: "uploading",
        }));

        try {
          const formData = new FormData();
          formData.append("file", fileInfo.file);

          await api.post("/api/media/upload", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          uploaded++;
          uploadedFiles.push(fileName);

          setUploadProgress((prev) => ({
            ...prev,
            current: i + 1,
            uploadedFiles: [...prev.uploadedFiles, fileName],
            stage: "processing",
          }));

          // Small delay to show progress animation
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Failed to upload ${fileName}:`, error);
          skipped++;
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          failedFiles.push({ name: fileName, error: errorMessage });

          setUploadProgress((prev) => ({
            ...prev,
            current: i + 1,
            failedFiles: [
              ...prev.failedFiles,
              { name: fileName, error: errorMessage },
            ],
          }));
        }
      }

      setUploadProgress((prev) => ({
        ...prev,
        stage: "complete",
      }));

      onUploadComplete?.({
        uploaded,
        skipped,
      });
    } catch (error) {
      console.error("Upload failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setUploadProgress((prev) => ({
        ...prev,
        stage: "complete",
        failedFiles: [{ name: "Upload process", error: errorMessage }],
      }));
    } finally {
      setUploading(false);
      setShowCompletionSummary(true);
    }
  };

  const resetUploadState = () => {
    setUploadProgress({
      current: 0,
      total: 0,
      uploadedFiles: [],
      failedFiles: [],
      stage: "uploading",
    });
    setShowCompletionSummary(false);
    setUploading(false);
  };

  return {
    uploading,
    uploadProgress,
    showCompletionSummary,
    uploadFiles,
    resetUploadState,
  };
};
