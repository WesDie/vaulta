# MediaModal Component

A comprehensive media modal component for viewing images and videos with advanced features including progressive image loading, zoom/pan capabilities, metadata display, and keyboard navigation.

## Features

### 🚀 Progressive Image Loading

- **Instant Thumbnails**: Shows low-quality thumbnails immediately for fast navigation
- **Background Loading**: Loads full-resolution images progressively in the background
- **Smart Caching**: Caches loaded images for instant display on re-visit
- **Quality Indicators**: Shows current image quality status (Preview/Full Quality)

### 📱 Optimized Navigation

- **Zero-Wait Navigation**: Switch between images instantly using cached thumbnails
- **Preloading**: Automatically preloads adjacent images for seamless browsing
- **Auto-Reset**: Zoom/pan resets automatically when navigating to new images
- **Keyboard Shortcuts**: Arrow keys, ESC, R (reset), I (info), Delete

### 🔍 Advanced Zoom & Pan

- **Smooth Zoom**: Mouse wheel and pinch-to-zoom support
- **Pan & Drag**: Click and drag to pan when zoomed in
- **Touch Support**: Full touch gesture support for mobile devices
- **Zoom Indicator**: Visual feedback for current zoom level

### 📊 Rich Metadata

- **EXIF Data**: Camera settings, GPS location, and technical details
- **File Information**: File size, dimensions, creation dates
- **Tag Management**: Add, remove, and manage tags
- **Collection Support**: Organize media into collections

## Usage

### Basic Usage

```tsx
import { MediaModal, useMediaModal } from "@/components/MediaModal";

function MediaGallery({ mediaFiles }) {
  const {
    selectedMedia,
    isModalOpen,
    openModal,
    closeModal,
    navigateToMedia,
    hasPrevious,
    hasNext,
    mediaFiles: allMediaFiles,
  } = useMediaModal(mediaFiles);

  return (
    <>
      {/* Your gallery grid */}
      {mediaFiles.map((media) => (
        <img
          key={media.id}
          src={`/api/media/${media.id}/image?size=thumb`}
          onClick={() => openModal(media)}
        />
      ))}

      {/* Enhanced Modal with Progressive Loading */}
      <MediaModal
        media={selectedMedia}
        isOpen={isModalOpen}
        onClose={closeModal}
        onPrevious={() => navigateToMedia("previous")}
        onNext={() => navigateToMedia("next")}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        mediaFiles={allMediaFiles} // Pass for preloading optimization
        onDelete={(id) => handleDelete(id)}
      />
    </>
  );
}
```

### Progressive Loading Hook

```tsx
import { useProgressiveImageLoad } from "@/components/MediaModal";

function CustomImageViewer({ mediaId }) {
  const { loadState, preloadImage } = useProgressiveImageLoad({
    mediaId,
    thumbnailUrl: `/api/media/${mediaId}/image?size=thumb`,
    fullImageUrl: `/originals/${filename}`,
    priority: true,
  });

  // Access loading states
  const { thumbnailLoaded, fullImageLoaded, error } = loadState;
}
```

## Performance Optimizations

### Image Loading Strategy

1. **Immediate Thumbnail**: Shows compressed thumbnail instantly
2. **Progressive Enhancement**: Loads full-resolution image in background
3. **Smooth Transition**: Fades from thumbnail to full image
4. **Smart Caching**: Prevents re-downloading of loaded images
5. **Preloading**: Loads adjacent images for faster navigation

### Memory Management

- **Automatic Cleanup**: Clears unused image references
- **Abort Controllers**: Cancels in-flight requests when navigating
- **Efficient Caching**: Uses WeakMap for automatic garbage collection

### Network Optimization

- **Priority Loading**: Current image loads first, then adjacent images
- **Bandwidth Aware**: Starts with thumbnails to minimize initial load time
- **Request Deduplication**: Prevents duplicate requests for same images

## Components

- **MediaModal**: Main modal container with navigation and controls
- **MediaViewer**: Core image/video display with progressive loading
- **MediaControls**: Navigation buttons and action controls
- **MetadataSidebar**: Expandable sidebar with EXIF and file details
- **ZoomIndicator**: Visual zoom level feedback

## Keyboard Shortcuts

- **Arrow Keys**: Navigate between images
- **ESC**: Close modal
- **R**: Reset zoom/pan
- **I**: Toggle metadata sidebar
- **Delete**: Delete current media (if enabled)
- **Mouse Wheel**: Zoom in/out
- **Click + Drag**: Pan when zoomed

## Props

### MediaModal Props

```tsx
interface MediaModalProps {
  media: MediaFile | null;
  isOpen: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onDelete?: (mediaId: string) => void;
  mediaFiles?: MediaFile[]; // For preloading optimization
}
```

## Browser Support

- **Modern Browsers**: Chrome 80+, Firefox 78+, Safari 14+, Edge 80+
- **Mobile Support**: iOS Safari 14+, Chrome Mobile 80+
- **Touch Gestures**: Full support for pinch-to-zoom and pan
- **Progressive Enhancement**: Graceful fallback for older browsers
