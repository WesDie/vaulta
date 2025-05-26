"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MediaFile } from "@/types";
import { mediaApi } from "@/services/api";

interface MediaCardProps {
  media: MediaFile;
  size: "small" | "medium" | "large";
  onSelect?: (media: MediaFile) => void;
}

const sizeClasses = {
  small: "w-32 h-32",
  medium: "w-48 h-48",
  large: "w-64 h-64",
};

export function MediaCard({ media, size, onSelect }: MediaCardProps) {
  const [imageError, setImageError] = useState(false);
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  const [thumbnailGenerated, setThumbnailGenerated] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Use relative URLs for image optimization to work with Docker network
  // The Next.js rewrites will handle routing these to the backend
  const optimizedImageUrl = `/api/media/${media.id}/image?size=thumb`;

  // Fallback to thumbnail path if the optimized endpoint doesn't work
  const thumbnailUrl = media.thumbnailPath
    ? `/api${media.thumbnailPath}`
    : null;

  const handleGenerateThumbnail = async () => {
    setThumbnailLoading(true);
    try {
      const result = await mediaApi.generateThumbnail(media.id);
      if (result.success && result.data?.thumbnailPath) {
        // Update the media object with new thumbnail path
        media.thumbnailPath = result.data.thumbnailPath;
        setImageError(false);
        setThumbnailGenerated(true);
        setImageLoading(true); // Reset loading state to show new image
      }
    } catch (error) {
      console.error("Failed to generate thumbnail:", error);
    } finally {
      setThumbnailLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isVideo = media.mimeType.startsWith("video/");
  const isImage = media.mimeType.startsWith("image/");

  // Remove auto-generation since the optimized endpoint handles this

  return (
    <div
      className={`relative group cursor-pointer bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${sizeClasses[size]}`}
      onClick={() => onSelect?.(media)}
    >
      {/* Media Preview */}
      <div className="relative w-full h-full">
        {(isImage || thumbnailUrl) && !imageError ? (
          <>
            <Image
              src={
                isImage ? optimizedImageUrl : thumbnailUrl || optimizedImageUrl
              }
              alt={media.filename}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              onLoad={() => setImageLoading(false)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
              loading="lazy"
            />
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                <div className="w-8 h-8 border-b-2 border-blue-500 rounded-full animate-spin"></div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-700">
            {isVideo ? (
              <div className="text-center">
                <div className="w-8 h-8 mb-2 text-gray-400">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500">Video</p>
              </div>
            ) : isImage ? (
              <div className="text-center">
                <div className="w-8 h-8 mb-2 text-gray-400">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-xs text-gray-500">Image</p>
                {!thumbnailUrl && !thumbnailLoading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateThumbnail();
                    }}
                    className="mt-1 text-xs text-blue-500 hover:text-blue-600"
                  >
                    Generate Thumbnail
                  </button>
                )}
                {thumbnailLoading && (
                  <p className="mt-1 text-xs text-gray-400">Generating...</p>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="w-8 h-8 mb-2 text-gray-400">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-xs text-gray-500">File</p>
              </div>
            )}
          </div>
        )}

        {/* Overlay with metadata */}
        <div className="absolute inset-0 flex flex-col justify-end p-3 transition-all duration-200 bg-black bg-opacity-0 opacity-0 group-hover:bg-opacity-50 group-hover:opacity-100">
          <div className="text-white">
            <h3 className="text-sm font-medium truncate">{media.filename}</h3>
            <p className="text-xs opacity-75">
              {formatFileSize(media.fileSize)}
            </p>
            {media.width && media.height && (
              <p className="text-xs opacity-75">
                {media.width} × {media.height}
              </p>
            )}
          </div>
        </div>

        {/* Tags indicator */}
        {media.tags && media.tags.length > 0 && (
          <div className="absolute top-2 right-2">
            <div className="px-2 py-1 text-xs text-white bg-black bg-opacity-50 rounded">
              {media.tags.length} tag{media.tags.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}

        {/* Video indicator */}
        {isVideo && (
          <div className="absolute top-2 left-2">
            <div className="p-1 text-white bg-black bg-opacity-50 rounded">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
