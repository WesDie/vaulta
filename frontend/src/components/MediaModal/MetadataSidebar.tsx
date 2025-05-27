import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { MetadataSidebarProps } from "./types";
import { mediaApi } from "@/services/api";

export function MetadataSidebar({
  media,
  showMetadata,
  imageContainerHeight,
}: MetadataSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const [extractingExif, setExtractingExif] = useState(false);

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

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    setExpandedSections(newExpanded);
  };

  const handleExtractExif = async () => {
    if (!media.mimeType.startsWith("image/")) {
      alert("EXIF data can only be extracted from images");
      return;
    }

    setExtractingExif(true);
    try {
      const result = await mediaApi.extractExif(media.id);
      console.log("EXIF extraction result:", result);

      if (result.success) {
        // Instead of reloading, we should update the media object
        // For now, we'll reload but this should be improved to update the parent component
        alert(
          "EXIF data extracted successfully! The page will refresh to show the new data."
        );
        window.location.reload();
      } else {
        console.error("EXIF extraction failed:", result);
        alert(
          `Failed to extract EXIF data: ${result.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error extracting EXIF data:", error);
      alert(
        `Failed to extract EXIF data: ${
          error instanceof Error ? error.message : "Network error"
        }`
      );
    } finally {
      setExtractingExif(false);
    }
  };

  const formatExifValue = (value: any): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "object") {
      if (value.type === "buffer") {
        return `[Binary data: ${value.length} bytes]`;
      }
      return JSON.stringify(value, null, 2);
    }
    if (typeof value === "number") {
      return value.toString();
    }
    return String(value);
  };

  const renderExifSection = (title: string, data: Record<string, any>) => {
    const sectionKey = title.toLowerCase().replace(/\s+/g, "-");
    const isExpanded = expandedSections.has(sectionKey);

    return (
      <div key={sectionKey} className="border rounded-xl bg-card border-border">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between w-full p-4 text-left transition-colors hover:bg-muted/50"
        >
          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            {title}
          </h3>
          <svg
            className={`w-4 h-4 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {isExpanded && (
          <div className="px-4 pb-4 space-y-2 overflow-y-auto text-sm max-h-48">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="flex items-start justify-between">
                <span className="flex-shrink-0 mr-2 font-mono text-xs text-muted-foreground">
                  {key}:
                </span>
                <span className="font-medium text-right break-all text-foreground">
                  {formatExifValue(value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
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

  // Update height when imageContainerHeight changes
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar || !imageContainerHeight || !showMetadata) return;

    gsap.to(sidebar, {
      height: `${imageContainerHeight}px`,
      duration: 0.3,
      ease: "power2.out",
    });
  }, [imageContainerHeight, showMetadata]);

  return (
    <div
      ref={sidebarRef}
      className="overflow-y-auto bg-muted"
      style={{
        maxHeight: showMetadata
          ? imageContainerHeight
            ? `${imageContainerHeight}px`
            : "60vh"
          : "0",
        height: showMetadata
          ? imageContainerHeight
            ? `${imageContainerHeight}px`
            : "auto"
          : "0",
      }}
    >
      {showMetadata && (
        <div ref={contentRef} className="h-full p-6 space-y-6 overflow-y-auto">
          {/* Header with filename */}
          <div className="pb-4 border-b border-border">
            <h2 className="text-xl font-bold leading-tight break-all text-foreground">
              {media.filename}
            </h2>
          </div>

          {/* Basic info cards */}
          <div className="grid gap-4">
            <div className="p-4 transition-colors border rounded-xl bg-card border-border">
              <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                File Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span className="font-medium text-foreground">
                    {formatFileSize(media.fileSize)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium text-foreground">
                    {media.mimeType}
                  </span>
                </div>
                {media.width && media.height && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dimensions:</span>
                    <span className="font-medium text-foreground">
                      {media.width} × {media.height}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium text-foreground">
                    {formatDate(media.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* EXIF Data */}
            {media.mimeType.startsWith("image/") && (
              <div className="p-4 transition-colors border rounded-xl bg-card border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                    Camera Info
                  </h3>
                  <button
                    onClick={handleExtractExif}
                    disabled={extractingExif}
                    className="px-2 py-1 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {extractingExif
                      ? "Extracting..."
                      : media.exifData
                      ? "Re-extract"
                      : "Extract EXIF"}
                  </button>
                </div>
                {media.exifData ? (
                  <div className="space-y-2 text-sm">
                    {media.exifData.camera && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Camera:</span>
                        <span className="font-medium text-foreground">
                          {media.exifData.camera}
                        </span>
                      </div>
                    )}
                    {media.exifData.lens && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lens:</span>
                        <span className="font-medium text-foreground">
                          {media.exifData.lens}
                        </span>
                      </div>
                    )}
                    {media.exifData.aperture && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Aperture:</span>
                        <span className="font-medium text-foreground">
                          f/{media.exifData.aperture}
                        </span>
                      </div>
                    )}
                    {media.exifData.shutterSpeed && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shutter:</span>
                        <span className="font-medium text-foreground">
                          {media.exifData.shutterSpeed}
                        </span>
                      </div>
                    )}
                    {media.exifData.iso && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ISO:</span>
                        <span className="font-medium text-foreground">
                          {media.exifData.iso}
                        </span>
                      </div>
                    )}
                    {media.exifData.focalLength && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Focal Length:
                        </span>
                        <span className="font-medium text-foreground">
                          {media.exifData.focalLength}mm
                        </span>
                      </div>
                    )}
                    {media.exifData.dateTaken && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Date Taken:
                        </span>
                        <span className="font-medium text-foreground">
                          {formatDate(media.exifData.dateTaken)}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No EXIF data available. Click "Extract EXIF" to analyze this
                    image.
                  </div>
                )}
              </div>
            )}

            {/* Location Data */}
            {media.exifData?.gps && (
              <div className="p-4 transition-colors border rounded-xl bg-card border-border">
                <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                  Location
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Latitude:</span>
                    <span className="font-medium text-foreground">
                      {media.exifData.gps.latitude}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Longitude:</span>
                    <span className="font-medium text-foreground">
                      {media.exifData.gps.longitude}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Complete EXIF Data */}
            {media.exifData?.rawExifData && (
              <div className="space-y-2">
                <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                  Complete EXIF Data
                </h3>
                {Object.entries(media.exifData.rawExifData).map(
                  ([sectionName, sectionData]) => {
                    if (
                      typeof sectionData === "object" &&
                      sectionData !== null &&
                      !Array.isArray(sectionData)
                    ) {
                      return renderExifSection(
                        sectionName,
                        sectionData as Record<string, any>
                      );
                    }
                    return null;
                  }
                )}
              </div>
            )}

            {/* Tags */}
            {media.tags && media.tags.length > 0 && (
              <div className="p-4 transition-colors border rounded-xl bg-card border-border">
                <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {media.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs rounded-full bg-primary text-primary-foreground"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Collections */}
            {media.collections && media.collections.length > 0 && (
              <div className="p-4 transition-colors border rounded-xl bg-card border-border">
                <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                  Collections
                </h3>
                <div className="space-y-1">
                  {media.collections.map((collection, index) => (
                    <div key={index} className="text-sm text-foreground">
                      {collection.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Download Link */}
            <div className="p-4 transition-colors border rounded-xl bg-card border-border">
              <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                Download
              </h3>
              <a
                href={originalUrl}
                download={media.filename}
                className="inline-flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <svg
                  className="w-4 h-4 mr-2"
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
                Download Original
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
