"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { MediaFile } from "@/types";
import { mediaApi } from "@/services/api";

interface MediaCardProps {
  media: MediaFile;
  onSelect?: (media: MediaFile) => void;
}

export function MediaCard({ media, onSelect }: MediaCardProps) {
  const [imageError, setImageError] = useState(false);
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [cardWidth, setCardWidth] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  // Use relative URLs for image optimization to work with Docker network
  // The Next.js rewrites will handle routing these to the backend
  const optimizedImageUrl = `/api/media/${media.id}/image?size=thumb`;

  // Fallback to thumbnail path if the optimized endpoint doesn't work
  const thumbnailUrl = media.thumbnailPath
    ? `/api${media.thumbnailPath}`
    : null;

  // Check card width on mount and resize
  useEffect(() => {
    const updateCardWidth = () => {
      if (cardRef.current) {
        setCardWidth(cardRef.current.offsetWidth);
      }
    };

    updateCardWidth();
    window.addEventListener("resize", updateCardWidth);
    return () => window.removeEventListener("resize", updateCardWidth);
  }, []);

  const handleGenerateThumbnail = async () => {
    setThumbnailLoading(true);
    try {
      const result = await mediaApi.generateThumbnail(media.id);
      if (result.success && result.data?.thumbnailPath) {
        // Update the media object with new thumbnail path
        media.thumbnailPath = result.data.thumbnailPath;
        setImageError(false);
        setImageLoading(true); // Reset loading state to show new image
      }
    } catch (error) {
      console.error("Failed to generate thumbnail:", error);
    } finally {
      setThumbnailLoading(false);
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Removed mouse tracking transform as requested
  }, []);

  const handleMouseEnter = () => {
    // GSAP animation for image - faster duration
    if (imageRef.current) {
      gsap.to(imageRef.current, {
        duration: 0.2, // Faster animation
        ease: "power2.out",
      });
    }

    // Show info overlay with animation if card is wide enough - faster duration
    if (cardWidth >= 115 && overlayRef.current && infoRef.current) {
      gsap.set(overlayRef.current, {
        display: "flex",
        opacity: 0,
      });

      gsap.set(infoRef.current, {
        y: 20,
        opacity: 0,
      });

      const tl = gsap.timeline();
      tl.to(overlayRef.current, {
        opacity: 1,
        duration: 0.15, // Faster animation
        ease: "power2.out",
      }).to(
        infoRef.current,
        {
          y: 0,
          opacity: 1,
          duration: 0.2, // Faster animation
          ease: "back.out(1.7)",
        },
        "-=0.05"
      );
    }
  };

  const handleMouseLeave = () => {
    // GSAP animation to reset image - instant/very fast
    if (imageRef.current) {
      gsap.to(imageRef.current, {
        x: 0,
        y: 0,
        duration: 0.1, // Very fast reset
        ease: "power2.out",
      });
    }

    // Hide info overlay with animation - instant
    if (overlayRef.current && infoRef.current) {
      gsap.set(overlayRef.current, { display: "none" });
      gsap.set(infoRef.current, { y: 20, opacity: 0 });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getFileExtension = (filename: string): string => {
    return filename.split(".").pop()?.toUpperCase() || "FILE";
  };

  const isVideo = media.mimeType.startsWith("video/");
  const isImage = media.mimeType.startsWith("image/");

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden transition-opacity cursor-pointer group bg-black/5 hover:opacity-90"
      onClick={() => onSelect?.(media)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
              className="object-cover"
              onError={() => setImageError(true)}
              onLoad={() => setImageLoading(false)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
              loading="lazy"
              ref={imageRef}
            />
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full border-t-gray-600 animate-spin"></div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100">
            {isVideo ? (
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 text-gray-400">
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-full h-full"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-600">Video</p>
              </div>
            ) : isImage ? (
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 text-gray-400">
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-full h-full"
                  >
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                </div>
                {!thumbnailUrl && !thumbnailLoading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateThumbnail();
                    }}
                    className="px-2 py-1 text-xs text-gray-600 bg-white rounded hover:bg-gray-50"
                  >
                    Generate
                  </button>
                )}
                {thumbnailLoading && (
                  <div className="w-4 h-4 mx-auto border-2 border-gray-300 rounded-full border-t-gray-600 animate-spin"></div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 text-gray-400">
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-full h-full"
                  >
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-600">File</p>
              </div>
            )}
          </div>
        )}

        {/* Hover Info Overlay */}
        {cardWidth >= 115 && (
          <div
            ref={overlayRef}
            className="absolute inset-0 flex items-end justify-start p-3 bg-black/60"
            style={{ display: "none" }}
          >
            <div ref={infoRef} className="space-y-1 text-sm text-white">
              <div className="font-medium">
                {getFileExtension(media.filename)}
              </div>
              <div className="text-xs opacity-90">
                {formatFileSize(media.fileSize)}
              </div>
              {media.width && media.height && (
                <div className="text-xs opacity-90">
                  {media.width} × {media.height}
                </div>
              )}
              {media.createdAt && (
                <div className="text-xs opacity-90">
                  {formatDate(media.createdAt)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Video indicator - minimal */}
        {isVideo && !imageError && (
          <div className="absolute top-1 left-1">
            <div className="p-1 rounded bg-black/50">
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Tags indicator - minimal */}
        {media.tags && media.tags.length > 0 && (
          <div className="absolute top-1 right-1">
            <div className="px-1 py-0.5 text-xs text-white bg-black/50 rounded">
              {media.tags.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
