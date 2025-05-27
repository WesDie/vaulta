# MediaModal Components

This directory contains the modular MediaModal implementation with improved zoom functionality and better file organization.

## Structure

```
MediaModal/
├── MediaModal.tsx          # Main modal component
├── MediaViewer.tsx         # Image/video display with zoom
├── MetadataSidebar.tsx     # File metadata and EXIF display
├── MediaControls.tsx       # Floating control buttons
├── ZoomIndicator.tsx       # Zoom percentage indicator
├── useZoom.ts             # Custom hook for zoom logic
├── types.ts               # TypeScript interfaces
├── index.ts               # Export barrel
└── README.md              # This file
```

## Key Features

### 🔍 **Advanced Zoom System**

- **Smart constraints**: Can't zoom out smaller than image fit to container
- **Smooth pan**: Drag to pan when zoomed in
- **Mouse wheel zoom**: Natural scroll-to-zoom behavior
- **Touch gestures**: Pinch-to-zoom on mobile devices
- **Boundary detection**: Prevents panning outside image boundaries

### 🎨 **Modern UI/UX**

- **Glassmorphism design** with backdrop blur
- **Light/dark theme** integration
- **Smooth animations** and micro-interactions
- **Responsive layout** that adapts to screen size
- **Sharp image corners** with fully rounded buttons

### ⚡ **Performance Optimizations**

- **Modular components** for better code splitting
- **Custom hooks** for reusable logic
- **Optimized re-renders** with proper memoization
- **Efficient event handling** with cleanup

## Usage

```tsx
import { MediaModal } from "@/components/MediaModal";

<MediaModal
  media={selectedMedia}
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onPrevious={handlePrevious}
  onNext={handleNext}
  hasPrevious={hasPrevious}
  hasNext={hasNext}
/>;
```

## Keyboard Shortcuts

- **ESC**: Close modal
- **I**: Toggle metadata sidebar
- **R**: Reset zoom (images only)
- **← / →**: Navigate between images

## Zoom Constraints

The zoom system automatically calculates minimum zoom based on:

- Container dimensions
- Image dimensions
- Fit-to-container scale
- Minimum 50% of fit scale (but not smaller than 0.1x)
- Maximum 5x zoom

This ensures images can't be zoomed smaller than what naturally fits in the container while maintaining reasonable zoom limits.
