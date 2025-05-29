export interface FileInfo {
  path: string;
  name: string;
  size: number;
  type: string;
  extension: string;
  file: File;
}

export interface FolderUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (result: { uploaded: number; skipped: number }) => void;
}

export interface UploadProgressState {
  current: number;
  total: number;
  currentFileName?: string;
  uploadedFiles: string[];
  failedFiles: { name: string; error: string }[];
  stage: "uploading" | "processing" | "complete";
}

export interface FileTypeInfo {
  color: string;
  icon: string;
  type: string;
}

// Extend the HTMLInputElement interface to include webkitdirectory
declare module "react" {
  interface HTMLAttributes<T> {
    webkitdirectory?: string;
  }
}
