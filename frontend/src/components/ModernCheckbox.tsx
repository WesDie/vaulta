"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface ModernCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  onClick?: (e: React.MouseEvent) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ModernCheckbox({
  checked,
  onChange,
  onClick,
  size = "md",
  className = "",
}: ModernCheckboxProps) {
  const checkboxRef = useRef<HTMLDivElement>(null);
  const checkmarkRef = useRef<SVGSVGElement>(null);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  useEffect(() => {
    if (checkmarkRef.current) {
      if (checked) {
        gsap.fromTo(
          checkmarkRef.current,
          {
            scale: 0,
            opacity: 0,
            rotation: -45,
          },
          {
            scale: 1,
            opacity: 1,
            rotation: 0,
            duration: 0.3,
            ease: "back.out(1.7)",
          }
        );
      } else {
        gsap.to(checkmarkRef.current, {
          scale: 0,
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
        });
      }
    }
  }, [checked]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(!checked);
    onClick?.(e);

    // Add a satisfying click animation
    if (checkboxRef.current) {
      gsap.to(checkboxRef.current, {
        scale: 0.9,
        duration: 0.1,
        ease: "power2.out",
        yoyo: true,
        repeat: 1,
      });
    }
  };

  return (
    <div
      ref={checkboxRef}
      onClick={handleClick}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-lg cursor-pointer
        transition-all duration-200 ease-out
        ${
          checked
            ? "bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-blue-500 shadow-lg shadow-blue-500/25"
            : "bg-card border-2 border-border hover:border-border/80 shadow-md"
        }
        hover:scale-110 active:scale-95
        ${className}
      `}
    >
      <svg
        ref={checkmarkRef}
        className={`${iconSizes[size]} text-white`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{ opacity: checked ? 1 : 0 }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
  );
}
