import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { MetadataSidebarProps } from "../types";
import { QuickStats } from "./components/QuickStats";
import { FileDetails } from "./components/FileDetails";
import { ExifData } from "./components/ExifData";
import { LocationData } from "./components/LocationData";
import { Collections } from "./components/Collections";
import { DownloadSection } from "./components/DownloadSection";
import { TagEditor } from "../TagEditor";

export function MetadataSidebar({
  media,
  showMetadata,
  imageContainerHeight,
  onMediaUpdate,
}: MetadataSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // GSAP animations for sidebar toggle
  useEffect(() => {
    const sidebar = sidebarRef.current;
    const content = contentRef.current;

    if (!sidebar) return;

    if (showMetadata) {
      // Show animation
      gsap.set(sidebar, { width: 0, opacity: 0 });
      gsap.to(sidebar, {
        width: "26rem", // Slightly wider for better readability
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
      className="overflow-hidden border-l bg-gradient-to-b from-background/95 to-muted/95 backdrop-blur-sm border-border/50"
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
        <div ref={contentRef} className="h-full overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header with filename */}
            <div className="pb-6 border-b border-border/30">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <svg
                    className="w-5 h-5 text-primary"
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
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold leading-tight break-all text-foreground">
                    {media.filename}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Media Information
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <QuickStats media={media} />

            {/* File Details */}
            <FileDetails media={media} />

            {/* Tags - Most important section, so it's prominently placed */}
            {onMediaUpdate && (
              <TagEditor media={media} onMediaUpdate={onMediaUpdate} />
            )}

            {/* EXIF Data */}
            <ExifData media={media} onMediaUpdate={onMediaUpdate} />

            {/* Location Data */}
            <LocationData media={media} />

            {/* Collections */}
            <Collections media={media} />

            {/* Download Link */}
            <DownloadSection media={media} />
          </div>
        </div>
      )}
    </div>
  );
}
