import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useTheme } from "../ThemeProvider";
import { MetadataSidebarProps } from "./types";

export function MetadataSidebar({ media, showMetadata }: MetadataSidebarProps) {
  const { theme } = useTheme();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

  const originalUrl = `/originals/${media.filename}`;

  // GSAP animations for sidebar toggle
  useEffect(() => {
    const sidebar = sidebarRef.current;
    const content = contentRef.current;

    if (!sidebar) return;

    if (showMetadata) {
      // Show animation
      gsap.set(sidebar, { width: 0, opacity: 0 });
      gsap.to(sidebar, {
        width: "24rem", // w-96 equivalent
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
      });

      if (content) {
        gsap.fromTo(
          content,
          { x: 30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.3, delay: 0.1, ease: "power2.out" }
        );
      }
    } else {
      // Hide animation
      gsap.to(sidebar, {
        width: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      });
    }
  }, [showMetadata]);

  return (
    <div
      ref={sidebarRef}
      className={`
        overflow-y-auto
        ${theme === "dark" ? "bg-gray-800/50" : "bg-gray-100/50"}
        ${showMetadata ? "p-6" : "p-0"}
        ${showMetadata ? "lg:rounded-r-2xl" : ""}
      `}
    >
      {showMetadata && (
        <div ref={contentRef} className="space-y-6">
          {/* Header with filename */}
          <div className="pb-4 border-b border-gray-300/20">
            <h2
              className={`
                text-xl font-bold break-all leading-tight
                ${theme === "dark" ? "text-white" : "text-gray-900"}
              `}
            >
              {media.filename}
            </h2>
          </div>

          {/* Basic info cards */}
          <div className="grid gap-4">
            <div
              className={`
                p-4 rounded-xl border transition-colors
                ${
                  theme === "dark"
                    ? "bg-gray-700/30 border-gray-600/30"
                    : "bg-white/60 border-gray-300/30"
                }
              `}
            >
              <h3
                className={`
                  font-semibold mb-3 text-sm uppercase tracking-wide
                  ${theme === "dark" ? "text-gray-300" : "text-gray-600"}
                `}
              >
                File Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span
                    className={
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }
                  >
                    Size:
                  </span>
                  <span
                    className={`font-medium ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {formatFileSize(media.fileSize)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className={
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }
                  >
                    Type:
                  </span>
                  <span
                    className={`font-medium ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {media.mimeType}
                  </span>
                </div>
                {media.width && media.height && (
                  <div className="flex justify-between">
                    <span
                      className={
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }
                    >
                      Dimensions:
                    </span>
                    <span
                      className={`font-medium ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {media.width} × {media.height}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span
                    className={
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }
                  >
                    Created:
                  </span>
                  <span
                    className={`font-medium ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {formatDate(media.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* EXIF Data */}
            {media.exifData && (
              <div
                className={`
                  p-4 rounded-xl border transition-colors
                  ${
                    theme === "dark"
                      ? "bg-gray-700/30 border-gray-600/30"
                      : "bg-white/60 border-gray-300/30"
                  }
                `}
              >
                <h3
                  className={`
                    font-semibold mb-3 text-sm uppercase tracking-wide
                    ${theme === "dark" ? "text-gray-300" : "text-gray-600"}
                  `}
                >
                  Camera Info
                </h3>
                <div className="space-y-2 text-sm">
                  {media.exifData.camera && (
                    <div className="flex justify-between">
                      <span
                        className={
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }
                      >
                        Camera:
                      </span>
                      <span
                        className={`font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {media.exifData.camera}
                      </span>
                    </div>
                  )}
                  {media.exifData.lens && (
                    <div className="flex justify-between">
                      <span
                        className={
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }
                      >
                        Lens:
                      </span>
                      <span
                        className={`font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {media.exifData.lens}
                      </span>
                    </div>
                  )}
                  {media.exifData.focalLength && (
                    <div className="flex justify-between">
                      <span
                        className={
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }
                      >
                        Focal:
                      </span>
                      <span
                        className={`font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {media.exifData.focalLength}mm
                      </span>
                    </div>
                  )}
                  {media.exifData.aperture && (
                    <div className="flex justify-between">
                      <span
                        className={
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }
                      >
                        Aperture:
                      </span>
                      <span
                        className={`font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        f/{media.exifData.aperture}
                      </span>
                    </div>
                  )}
                  {media.exifData.shutterSpeed && (
                    <div className="flex justify-between">
                      <span
                        className={
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }
                      >
                        Shutter:
                      </span>
                      <span
                        className={`font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {media.exifData.shutterSpeed}
                      </span>
                    </div>
                  )}
                  {media.exifData.iso && (
                    <div className="flex justify-between">
                      <span
                        className={
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }
                      >
                        ISO:
                      </span>
                      <span
                        className={`font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {media.exifData.iso}
                      </span>
                    </div>
                  )}
                  {media.exifData.dateTaken && (
                    <div className="flex justify-between">
                      <span
                        className={
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }
                      >
                        Taken:
                      </span>
                      <span
                        className={`font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {formatDate(media.exifData.dateTaken)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* GPS Data */}
            {media.exifData?.gps && (
              <div
                className={`
                  p-4 rounded-xl border transition-colors
                  ${
                    theme === "dark"
                      ? "bg-gray-700/30 border-gray-600/30"
                      : "bg-white/60 border-gray-300/30"
                  }
                `}
              >
                <h3
                  className={`
                    font-semibold mb-3 text-sm uppercase tracking-wide
                    ${theme === "dark" ? "text-gray-300" : "text-gray-600"}
                  `}
                >
                  Location
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span
                      className={
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }
                    >
                      Latitude:
                    </span>
                    <span
                      className={`font-medium ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {media.exifData.gps.latitude.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }
                    >
                      Longitude:
                    </span>
                    <span
                      className={`font-medium ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {media.exifData.gps.longitude.toFixed(6)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            {media.tags && media.tags.length > 0 && (
              <div
                className={`
                  p-4 rounded-xl border transition-colors
                  ${
                    theme === "dark"
                      ? "bg-gray-700/30 border-gray-600/30"
                      : "bg-white/60 border-gray-300/30"
                  }
                `}
              >
                <h3
                  className={`
                    font-semibold mb-3 text-sm uppercase tracking-wide
                    ${theme === "dark" ? "text-gray-300" : "text-gray-600"}
                  `}
                >
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {media.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 text-xs font-medium text-white rounded-full"
                      style={{ backgroundColor: tag.color || "#6b7280" }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Collections */}
            {media.collections && media.collections.length > 0 && (
              <div
                className={`
                  p-4 rounded-xl border transition-colors
                  ${
                    theme === "dark"
                      ? "bg-gray-700/30 border-gray-600/30"
                      : "bg-white/60 border-gray-300/30"
                  }
                `}
              >
                <h3
                  className={`
                    font-semibold mb-3 text-sm uppercase tracking-wide
                    ${theme === "dark" ? "text-gray-300" : "text-gray-600"}
                  `}
                >
                  Collections
                </h3>
                <div className="space-y-3">
                  {media.collections.map((collection) => (
                    <div key={collection.id}>
                      <p
                        className={`font-medium text-sm ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {collection.name}
                      </p>
                      {collection.description && (
                        <p
                          className={`text-xs ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {collection.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-4 space-y-3">
            <a
              href={originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-medium text-white transition-all duration-200 transform bg-blue-500 rounded-full hover:scale-105 active:scale-95 hover:bg-blue-600"
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
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Open Original
            </a>
            <a
              href={originalUrl}
              download={media.filename}
              className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-medium text-white transition-all duration-200 transform bg-green-500 rounded-full hover:scale-105 active:scale-95 hover:bg-green-600"
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
