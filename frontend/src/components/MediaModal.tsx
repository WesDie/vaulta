"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MediaFile } from "@/types";

interface MediaModalProps {
  media: MediaFile | null;
  isOpen: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function MediaModal({
  media,
  isOpen,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: MediaModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageSize, setImageSize] = useState<"thumb" | "full">("thumb");
  const [fullImageLoaded, setFullImageLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setImageSize("thumb");
      setFullImageLoaded(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, media?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          if (hasPrevious && onPrevious) onPrevious();
          break;
        case "ArrowRight":
          if (hasNext && onNext) onNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasPrevious, hasNext, onPrevious, onNext, onClose]);

  if (!isOpen || !media) return null;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const optimizedImageUrl = `${apiUrl}/api/media/${media.id}/image?size=thumb`;
  const fullImageUrl = `${apiUrl}/api/media/${media.id}/image?size=full`;
  const originalUrl = `${apiUrl}/originals/${media.filename}`;
  const isImage = media.mimeType.startsWith("image/");
  const isVideo = media.mimeType.startsWith("video/");

  const handleThumbnailLoad = () => {
    setIsLoading(false);
    // Start loading full resolution image
    if (!fullImageLoaded) {
      setImageSize("full");
    }
  };

  const handleFullImageLoad = () => {
    setFullImageLoaded(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Navigation buttons */}
      {hasPrevious && onPrevious && (
        <button
          onClick={onPrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {hasNext && onNext && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all"
      >
        <svg
          className="w-6 h-6"
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

      {/* Content */}
      <div className="relative z-10 max-w-7xl max-h-full mx-4 flex flex-col lg:flex-row bg-black rounded-lg overflow-hidden">
        {/* Media viewer */}
        <div className="flex-1 flex items-center justify-center relative bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {isImage && (
            <div className="relative max-w-full max-h-[90vh] flex items-center justify-center">
              {/* Thumbnail image - loads first */}
              {imageSize === "thumb" && (
                <Image
                  src={optimizedImageUrl}
                  alt={media.filename}
                  width={media.width || 800}
                  height={media.height || 600}
                  className="max-w-full max-h-full object-contain"
                  onLoad={handleThumbnailLoad}
                  onError={() => setIsLoading(false)}
                  priority
                />
              )}

              {/* Full resolution image - loads after thumbnail */}
              {imageSize === "full" && (
                <Image
                  src={originalUrl}
                  alt={media.filename}
                  width={media.width || 800}
                  height={media.height || 600}
                  className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                    fullImageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={handleFullImageLoad}
                  onError={() => setFullImageLoaded(true)}
                  priority
                />
              )}

              {/* Show thumbnail behind full image until it loads */}
              {imageSize === "full" && !fullImageLoaded && (
                <Image
                  src={optimizedImageUrl}
                  alt={media.filename}
                  width={media.width || 800}
                  height={media.height || 600}
                  className="absolute inset-0 max-w-full max-h-full object-contain"
                  style={{ zIndex: -1 }}
                />
              )}
            </div>
          )}

          {isVideo && (
            <video
              src={originalUrl}
              controls
              className="max-w-full max-h-[90vh]"
              onLoadedData={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* Metadata sidebar */}
        <div className="w-full lg:w-80 bg-gray-900 text-white p-6 overflow-y-auto max-h-[90vh]">
          <div className="space-y-6">
            {/* Basic info */}
            <div>
              <h2 className="text-lg font-semibold mb-2 break-all">
                {media.filename}
              </h2>
              <div className="space-y-1 text-sm text-gray-300">
                <p>Size: {formatFileSize(media.fileSize)}</p>
                <p>Type: {media.mimeType}</p>
                {media.width && media.height && (
                  <p>
                    Dimensions: {media.width} × {media.height}
                  </p>
                )}
                <p>Created: {formatDate(media.createdAt)}</p>
              </div>
            </div>

            {/* EXIF Data */}
            {media.exifData && (
              <div>
                <h3 className="font-semibold mb-2">Camera Info</h3>
                <div className="space-y-1 text-sm text-gray-300">
                  {media.exifData.camera && (
                    <p>Camera: {media.exifData.camera}</p>
                  )}
                  {media.exifData.lens && <p>Lens: {media.exifData.lens}</p>}
                  {media.exifData.focalLength && (
                    <p>Focal Length: {media.exifData.focalLength}mm</p>
                  )}
                  {media.exifData.aperture && (
                    <p>Aperture: f/{media.exifData.aperture}</p>
                  )}
                  {media.exifData.shutterSpeed && (
                    <p>Shutter: {media.exifData.shutterSpeed}</p>
                  )}
                  {media.exifData.iso && <p>ISO: {media.exifData.iso}</p>}
                  {media.exifData.dateTaken && (
                    <p>Date Taken: {formatDate(media.exifData.dateTaken)}</p>
                  )}
                </div>
              </div>
            )}

            {/* GPS Data */}
            {media.exifData?.gps && (
              <div>
                <h3 className="font-semibold mb-2">Location</h3>
                <div className="space-y-1 text-sm text-gray-300">
                  <p>Latitude: {media.exifData.gps.latitude.toFixed(6)}</p>
                  <p>Longitude: {media.exifData.gps.longitude.toFixed(6)}</p>
                </div>
              </div>
            )}

            {/* Tags */}
            {media.tags && media.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {media.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-1 text-xs rounded-full"
                      style={{
                        backgroundColor: tag.color || "#4b5563",
                        color: "white",
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Collections */}
            {media.collections && media.collections.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Collections</h3>
                <div className="space-y-1">
                  {media.collections.map((collection) => (
                    <div key={collection.id} className="text-sm text-gray-300">
                      <p className="font-medium">{collection.name}</p>
                      {collection.description && (
                        <p className="text-xs text-gray-400">
                          {collection.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-gray-700">
              <div className="space-y-2">
                <a
                  href={originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Open Original
                </a>
                <a
                  href={originalUrl}
                  download={media.filename}
                  className="block w-full text-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
