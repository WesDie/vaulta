import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from "./constants";
import { FileTypeInfo } from "./types";

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export const getFileTypeInfo = (extension: string): FileTypeInfo => {
  if (IMAGE_EXTENSIONS.includes(extension)) {
    return {
      color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      icon: "🖼️",
      type: "Image",
    };
  }
  if (VIDEO_EXTENSIONS.includes(extension)) {
    return {
      color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      icon: "🎥",
      type: "Video",
    };
  }
  return {
    color: "bg-muted text-muted-foreground border-border",
    icon: "📄",
    type: "File",
  };
};
