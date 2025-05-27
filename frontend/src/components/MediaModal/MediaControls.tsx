import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useTheme } from "../ThemeProvider";
import { MediaControlsProps } from "./types";

export function MediaControls({
  showMetadata,
  onToggleMetadata,
  onResetZoom,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  isImage,
  onDelete,
}: MediaControlsProps) {
  const { theme } = useTheme();
  const controlsRef = useRef<HTMLDivElement>(null);
  const navButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const shortcutsRef = useRef<HTMLDivElement>(null);

  const buttonBaseClasses = `
    p-3 rounded-full transition-all duration-200 transform hover:scale-110 active:scale-95
    ${
      theme === "dark"
        ? "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20"
        : "bg-black/10 hover:bg-black/20 text-black backdrop-blur-md border border-black/20"
    }
  `;

  const navigationButtonClasses = `
    p-4 rounded-full transition-all duration-200 transform hover:scale-110 active:scale-95
    ${
      theme === "dark"
        ? "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20"
        : "bg-black/10 hover:bg-black/20 text-black backdrop-blur-md border border-black/20"
    }
  `;

  // GSAP animations for controls entrance
  useEffect(() => {
    const controls = controlsRef.current;
    const navButtons = navButtonsRef.current.filter(Boolean);
    const closeButton = closeButtonRef.current;
    const shortcuts = shortcutsRef.current;

    if (controls) {
      gsap.fromTo(
        controls,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.2 }
      );
    }

    navButtons.forEach((button, index) => {
      if (button) {
        gsap.fromTo(
          button,
          { x: index === 0 ? -30 : 30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
            delay: 0.3 + index * 0.1,
          }
        );
      }
    });

    if (closeButton) {
      gsap.fromTo(
        closeButton,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          ease: "back.out(1.5)",
          delay: 0.4,
        }
      );
    }

    if (shortcuts) {
      gsap.fromTo(
        shortcuts,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.5 }
      );
    }
  }, []);

  return (
    <>
      {/* Floating controls */}
      <div ref={controlsRef} className="absolute z-20 flex gap-3 top-6 left-6">
        <button
          onClick={onToggleMetadata}
          className={buttonBaseClasses}
          title="Toggle Info (I)"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        {isImage && (
          <>
            <button
              onClick={onResetZoom}
              className={buttonBaseClasses}
              title="Reset Zoom (R)"
            >
              <svg
                className="w-5 h-5"
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
            </button>
          </>
        )}

        {onDelete && (
          <button
            onClick={onDelete}
            className={`
              p-3 rounded-full transition-all duration-200 transform hover:scale-110 active:scale-95
              bg-red-600/20 hover:bg-red-600/30 text-red-500 backdrop-blur-md border border-red-500/30
            `}
            title="Delete Media (Del)"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation buttons */}
      {hasPrevious && onPrevious && (
        <button
          ref={(el) => {
            navButtonsRef.current[0] = el;
          }}
          onClick={onPrevious}
          className={`absolute left-6 top-1/2 -translate-y-1/2 z-20 ${navigationButtonClasses}`}
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
          ref={(el) => {
            navButtonsRef.current[1] = el;
          }}
          onClick={onNext}
          className={`absolute right-6 top-1/2 -translate-y-1/2 z-20 ${navigationButtonClasses}`}
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
        ref={closeButtonRef}
        onClick={onClose}
        className={`absolute top-6 right-6 z-20 ${buttonBaseClasses}`}
      >
        <svg
          className="w-5 h-5"
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

      {/* Keyboard shortcuts info */}
      <div
        ref={shortcutsRef}
        className={`
          absolute bottom-6 left-6 z-20 p-3 rounded-full text-xs
          ${
            theme === "dark"
              ? "bg-white/10 text-white/70 backdrop-blur-md border border-white/20"
              : "bg-black/10 text-black/70 backdrop-blur-md border border-black/20"
          }
        `}
      >
        <div className="flex gap-4">
          <span>ESC: Close</span>
          <span>I: Info</span>
          {isImage && <span>R: Reset</span>}
          {onDelete && <span>Del: Delete</span>}
          <span>← →: Navigate</span>
        </div>
      </div>
    </>
  );
}
