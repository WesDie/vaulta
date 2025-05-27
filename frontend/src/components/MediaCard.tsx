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

  return (
    <div
      className="relative group cursor-pointer bg-white dark:bg-gray-950 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
      onClick={() => onSelect?.(media)}
    >
      {/* Media Preview */}
      <div className="relative w-full overflow-hidden aspect-square">
        {(isImage || thumbnailUrl) && !imageError ? (
          <>
            <Image
              src={
                isImage ? optimizedImageUrl : thumbnailUrl || optimizedImageUrl
              }
              alt={media.filename}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
              onLoad={() => setImageLoading(false)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
              loading="lazy"
            />
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="w-6 h-6 loading-spinner"></div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full bg-gray-50 dark:bg-gray-900">
            {isVideo ? (
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600">
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-full h-full"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Video
                </p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  {formatFileSize(media.fileSize)}
                </p>
              </div>
            ) : isImage ? (
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600">
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-full h-full"
                  >
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Image
                </p>
                {!thumbnailUrl && !thumbnailLoading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateThumbnail();
                    }}
                    className="px-3 py-1 mt-2 text-xs text-gray-600 transition-colors bg-gray-100 rounded-full dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Generate Thumbnail
                  </button>
                )}
                {thumbnailLoading && (
                  <div className="flex items-center justify-center mt-2">
                    <div className="w-4 h-4 mr-2 loading-spinner"></div>
                    <span className="text-xs text-gray-400">Generating...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600">
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-full h-full"
                  >
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Document
                </p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  {formatFileSize(media.fileSize)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Video indicator */}
        {isVideo && !imageError && (
          <div className="absolute top-3 left-3">
            <div className="p-2 rounded-lg bg-black/60 backdrop-blur-sm">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Tags indicator */}
        {media.tags && media.tags.length > 0 && (
          <div className="absolute top-3 right-3">
            <div className="px-2 py-1 text-xs font-medium text-white rounded-lg bg-black/60 backdrop-blur-sm">
              {media.tags.length}
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 transition-all duration-300 opacity-0 bg-black/0 group-hover:bg-black/30 group-hover:opacity-100">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-3 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
              <svg
                className="w-6 h-6 text-gray-900 dark:text-gray-100"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Media Info */}
      <div className="p-4">
        <h3 className="mb-1 text-sm font-medium text-gray-900 truncate dark:text-gray-100">
          {media.filename}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{formatFileSize(media.fileSize)}</span>
          {media.width && media.height && (
            <span>
              {media.width} × {media.height}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
