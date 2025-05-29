"use client";

import { useStorageInfo } from "@/hooks/useStorage";
import { StorageInfo as StorageInfoType } from "@/types";
import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";

export function StorageInfo() {
  const { data: response, isLoading, error } = useStorageInfo();
  const [isExpanded, setIsExpanded] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (detailsRef.current && chevronRef.current) {
      if (isExpanded) {
        gsap.set(detailsRef.current, { height: "auto", opacity: 1 });
        gsap.from(detailsRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
        });
        gsap.to(chevronRef.current, {
          rotation: 180,
          duration: 0.3,
          ease: "power2.out",
        });
      } else {
        gsap.to(detailsRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
        });
        gsap.to(chevronRef.current, {
          rotation: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    }
  }, [isExpanded]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 mb-2 rounded bg-muted-foreground/20"></div>
        <div className="h-2 mb-1 rounded bg-muted-foreground/20"></div>
        <div className="w-3/4 h-2 rounded bg-muted-foreground/20"></div>
      </div>
    );
  }

  if (error || !response?.success || !response.data) {
    return (
      <div className="text-xs text-muted-foreground">
        Unable to load storage info
      </div>
    );
  }

  const storage = response.data;

  return (
    <StorageDisplay
      storage={storage}
      isExpanded={isExpanded}
      setIsExpanded={setIsExpanded}
      detailsRef={detailsRef}
      containerRef={containerRef}
      chevronRef={chevronRef}
    />
  );
}

interface StorageDisplayProps {
  storage: StorageInfoType;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  detailsRef: React.RefObject<HTMLDivElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  chevronRef: React.RefObject<HTMLDivElement>;
}

function StorageDisplay({
  storage,
  isExpanded,
  setIsExpanded,
  detailsRef,
  containerRef,
  chevronRef,
}: StorageDisplayProps) {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getUsagePercentage = () => {
    if (storage.totalSpace === 0) return 0;
    return Math.round((storage.usedSpace / storage.totalSpace) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage < 70) return "bg-green-500";
    if (percentage < 85) return "bg-yellow-500";
    return "bg-red-500";
  };

  const usagePercentage = getUsagePercentage();
  const usageColor = getUsageColor(usagePercentage);

  return (
    <div ref={containerRef} className="space-y-3">
      {/* Quick Info Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full group"
      >
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium tracking-wider uppercase text-muted-foreground">
              Storage
            </h4>
            <div
              ref={chevronRef}
              className="w-3 h-3 transition-colors text-muted-foreground group-hover:text-foreground"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </div>
          </div>
          <span className="font-medium text-foreground">
            {usagePercentage}%
          </span>
        </div>

        {/* Quick Usage Bar */}
        <div className="w-full h-2 mb-2 rounded-full bg-muted">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${usageColor}`}
            style={{ width: `${usagePercentage}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatBytes(storage.usedSpace)} used</span>
          <span>{formatBytes(storage.freeSpace)} free</span>
        </div>
      </button>

      {/* Detailed Info - Expandable */}
      <div
        ref={detailsRef}
        className="overflow-hidden"
        style={{ height: 0, opacity: 0 }}
      >
        <div className="pt-4 space-y-4 border-t border-border">
          {/* Media Statistics */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
              Media Library
            </h4>

            {/* Total Files and Size */}
            <div className="p-3 space-y-2 rounded-lg bg-muted/30">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Files</span>
                <span className="font-medium text-foreground">
                  {storage.mediaFiles.totalCount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Size</span>
                <span className="font-medium text-foreground">
                  {formatBytes(storage.mediaFiles.totalSize)}
                </span>
              </div>
            </div>

            {/* Images and Videos Cards */}
            <div className="grid grid-cols-2 gap-2">
              {/* Images Card */}
              <div className="p-3 border rounded-lg bg-blue-500/10 border-blue-500/20">
                <div className="flex items-center mb-2">
                  <span className="w-2 h-2 mr-2 bg-blue-500 rounded-full"></span>
                  <span className="text-xs font-medium text-foreground">
                    Images
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-foreground">
                    {storage.mediaFiles.imageCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatBytes(storage.mediaFiles.imageSize)}
                  </div>
                </div>
              </div>

              {/* Videos Card */}
              <div className="p-3 border rounded-lg bg-purple-500/10 border-purple-500/20">
                <div className="flex items-center mb-2">
                  <span className="w-2 h-2 mr-2 bg-purple-500 rounded-full"></span>
                  <span className="text-xs font-medium text-foreground">
                    Videos
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-foreground">
                    {storage.mediaFiles.videoCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatBytes(storage.mediaFiles.videoSize)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Storage Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
              Storage Breakdown
            </h4>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Originals</span>
                <span className="font-medium text-foreground">
                  {formatBytes(storage.originals.totalSize)}
                </span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Thumbnails</span>
                <span className="font-medium text-foreground">
                  {formatBytes(storage.thumbnails.totalSize)}
                </span>
              </div>
            </div>
          </div>

          {/* Storage Health Indicator */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  usagePercentage < 85
                    ? "bg-green-500"
                    : usagePercentage < 95
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              ></div>
              <span className="text-xs text-muted-foreground">
                {usagePercentage < 85
                  ? "Storage healthy"
                  : usagePercentage < 95
                  ? "Storage getting full"
                  : "Storage critically full"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
