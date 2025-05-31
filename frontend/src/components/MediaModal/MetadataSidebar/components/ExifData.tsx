import React, { useState } from "react";
import { MediaFile } from "@/types";
import { mediaApi } from "@/services/api";

interface ExifDataProps {
  media: MediaFile;
  onMediaUpdate?: (media: MediaFile) => void;
}

export function ExifData({ media, onMediaUpdate }: ExifDataProps) {
  const [extractingExif, setExtractingExif] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<string[]>([
    "image",
    "exif",
    "gps",
    "interoperability",
    "thumbnail",
    "makernote",
    "ifd0",
    "ifd1",
  ]);

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
    setCollapsedSections((prev) =>
      prev.includes(sectionName)
        ? prev.filter((s) => s !== sectionName)
        : [...prev, sectionName]
    );
  };

  const handleExtractExif = async () => {
    setExtractingExif(true);
    try {
      const response = await mediaApi.extractExif(media.id);
      if (response.success && response.data) {
        onMediaUpdate?.(response.data);
      } else {
        console.error("Failed to extract EXIF:", response.error);
      }
    } catch (error) {
      console.error("Error extracting EXIF:", error);
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
    const isExpanded = !collapsedSections.includes(sectionKey);

    return (
      <div
        key={sectionKey}
        className="overflow-hidden border rounded-lg bg-card/50 border-border/50 backdrop-blur-sm"
      >
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between w-full p-3 text-left transition-all duration-200 hover:bg-muted/30 group"
        >
          <h4 className="text-xs font-medium tracking-wider uppercase text-muted-foreground group-hover:text-foreground">
            {title}
          </h4>
          <div
            className={`p-1 rounded-full transition-all duration-200 ${
              isExpanded
                ? "bg-primary/10 rotate-180"
                : "group-hover:bg-muted/50"
            }`}
          >
            <svg
              className="w-3 h-3 transition-transform duration-200"
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
          </div>
        </button>
        {isExpanded && (
          <div className="px-3 pb-3 overflow-y-auto border-t border-border/30 max-h-40">
            <div className="space-y-1.5 pt-2">
              {Object.entries(data).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-start justify-between text-xs group"
                >
                  <span className="flex-shrink-0 mr-2 font-mono text-muted-foreground/80 group-hover:text-muted-foreground">
                    {key}:
                  </span>
                  <span className="font-medium text-right break-all text-foreground/90 group-hover:text-foreground">
                    {formatExifValue(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!media.mimeType.startsWith("image/")) {
    return null;
  }

  return (
    <>
      {/* Camera Info Section */}
      <div className="p-4 transition-all duration-200 border rounded-xl bg-card/50 border-border/50 hover:bg-card/70 hover:border-border/70">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h3 className="text-sm font-semibold text-foreground">
              Camera Info
            </h3>
          </div>
          <button
            onClick={handleExtractExif}
            disabled={extractingExif}
            className="px-3 py-1.5 text-xs font-medium transition-all duration-200 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed border border-primary/20 hover:border-primary"
          >
            {extractingExif ? (
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-3 h-3 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Extracting...
              </div>
            ) : media.exifData ? (
              "Re-extract"
            ) : (
              "Extract EXIF"
            )}
          </button>
        </div>
        {media.exifData ? (
          <div className="space-y-3">
            {/* Key camera settings in a grid */}
            <div className="grid grid-cols-2 gap-2">
              {media.exifData.camera && (
                <div className="p-2 rounded bg-muted/30">
                  <div className="text-xs text-muted-foreground">Camera</div>
                  <div
                    className="text-sm font-medium truncate text-foreground"
                    title={media.exifData.camera}
                  >
                    {media.exifData.camera}
                  </div>
                </div>
              )}
              {media.exifData.lens && (
                <div className="p-2 rounded bg-muted/30">
                  <div className="text-xs text-muted-foreground">Lens</div>
                  <div
                    className="text-sm font-medium truncate text-foreground"
                    title={media.exifData.lens}
                  >
                    {media.exifData.lens}
                  </div>
                </div>
              )}
              {media.exifData.aperture && (
                <div className="p-2 rounded bg-muted/30">
                  <div className="text-xs text-muted-foreground">Aperture</div>
                  <div className="text-sm font-medium text-foreground">
                    f/{media.exifData.aperture}
                  </div>
                </div>
              )}
              {media.exifData.shutterSpeed && (
                <div className="p-2 rounded bg-muted/30">
                  <div className="text-xs text-muted-foreground">Shutter</div>
                  <div className="text-sm font-medium text-foreground">
                    {media.exifData.shutterSpeed}
                  </div>
                </div>
              )}
              {media.exifData.iso && (
                <div className="p-2 rounded bg-muted/30">
                  <div className="text-xs text-muted-foreground">ISO</div>
                  <div className="text-sm font-medium text-foreground">
                    {media.exifData.iso}
                  </div>
                </div>
              )}
              {media.exifData.focalLength && (
                <div className="p-2 rounded bg-muted/30">
                  <div className="text-xs text-muted-foreground">
                    Focal Length
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {media.exifData.focalLength}mm
                  </div>
                </div>
              )}
            </div>
            {media.exifData.dateTaken && (
              <div className="flex items-center justify-between py-2 border-t border-border/30">
                <span className="text-sm text-muted-foreground">
                  Date Taken:
                </span>
                <span className="text-sm font-medium text-foreground">
                  {formatDate(media.exifData.dateTaken)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 text-center border border-dashed rounded-lg bg-muted/20 border-border/50">
            <svg
              className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
            </svg>
            <div className="text-sm text-muted-foreground">
              No EXIF data available
            </div>
            <div className="mt-1 text-xs text-muted-foreground/70">
              Click "Extract EXIF" to analyze this image
            </div>
          </div>
        )}
      </div>

      {/* Complete EXIF Data - Collapsed by default */}
      {media.exifData?.rawExifData && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-sm font-semibold text-muted-foreground">
              Complete EXIF Data
            </h3>
          </div>
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
    </>
  );
}
