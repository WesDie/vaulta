# MediaModal Component Suite

## Overview

The MediaModal is a comprehensive media viewing and management interface that has been optimized with a modular folder structure for better maintainability and reusability.

## Folder Structure

```
MediaModal/
├── index.ts                    # Main exports
├── types.ts                    # TypeScript definitions
├── MediaModal.tsx              # Main modal component
├── MediaViewer.tsx             # Image/video viewer with zoom
├── MediaControls.tsx           # Navigation and action controls
├── ZoomIndicator.tsx           # Zoom level indicator
├── ConfirmDialog.tsx           # Delete confirmation dialog
├── useProgressiveImageLoad.ts  # Progressive image loading hook
├── useZoom.ts                  # Zoom and pan functionality hook
├── README.md                   # This documentation
├── MetadataSidebar/            # Metadata sidebar components
│   ├── index.ts
│   ├── MetadataSidebar.tsx    # Main sidebar component
│   └── components/             # Modular sidebar components
│       ├── QuickStats.tsx      # File size, type, dimensions
│       ├── FileDetails.tsx     # MIME type, creation date
│       ├── ExifData.tsx        # Camera and EXIF information
│       ├── LocationData.tsx    # GPS location data
│       ├── Collections.tsx     # Collection membership
│       └── DownloadSection.tsx # Download original file
└── TagEditor/                  # Tag management components
    ├── index.ts
    ├── TagEditor.tsx           # Main tag editor component
    └── components/             # Modular tag components
        ├── AvailableTags.tsx   # List of available tags to add
        └── CreateTagForm.tsx   # Form to create new tags
```

## Global Tag Components

The tag system has been extracted into reusable components located at `@/components/ui/Tag`:

### Tag Component

```tsx
import { Tag } from "@/components/ui";

// Default size tag (for editor)
<Tag
  tag={tagObject}
  removable={true}
  onRemove={(tagId) => handleRemove(tagId)}
  loading={false}
/>

// Compact size tag (for media cards)
<Tag
  tag={tagObject}
  variant="compact"
  onClick={(tagId) => handleTagClick(tagId)}
/>
```

### TagList Component

```tsx
import { TagList } from "@/components/ui";

// Full size tag list with remove functionality
<TagList
  tags={mediaTags}
  removable={true}
  onRemove={handleRemoveTag}
  loading={false}
/>

// Compact tag list for media cards (with max display limit)
<TagList
  tags={mediaTags}
  variant="compact"
  maxDisplay={3}
  onClick={handleTagClick}
/>
```

## Tag Variants

### Default Variant

- Full-sized tags with text labels
- Used in the MediaModal TagEditor
- Shows tag name with colored dot indicator
- Supports remove button when `removable=true`

### Compact Variant

- Small circular tags showing only color
- Perfect for media cards and grid views
- Shows tag name on hover
- Takes up minimal space
- Supports remove button when `removable=true`

## Usage Examples

### In Media Cards

```tsx
import { TagList } from "@/components/ui";

function MediaCard({ media }) {
  return (
    <div className="media-card">
      <img src={media.thumbnailUrl} alt={media.filename} />
      <div className="media-info">
        <h3>{media.filename}</h3>
        <TagList
          tags={media.tags}
          variant="compact"
          maxDisplay={3}
          onClick={(tagId) => filterByTag(tagId)}
          className="mt-2"
        />
      </div>
    </div>
  );
}
```

### In Tag Management

```tsx
import { TagList } from "@/components/ui";

function TagManager({ selectedMedia }) {
  return (
    <div className="tag-manager">
      <h3>Applied Tags</h3>
      <TagList
        tags={selectedMedia.tags}
        removable={true}
        onRemove={handleRemoveTag}
        loading={isUpdating}
      />
    </div>
  );
}
```

## Features

### MediaModal

- ✅ Full-screen media viewing
- ✅ Zoom and pan functionality for images
- ✅ Keyboard navigation support
- ✅ Delete confirmation dialog
- ✅ Progressive image loading
- ✅ Preloading of adjacent images
- ✅ GSAP animations

### MetadataSidebar

- ✅ Modular component structure
- ✅ Quick stats (size, type, dimensions)
- ✅ File details with creation date
- ✅ EXIF data extraction and display
- ✅ GPS location data (when available)
- ✅ Collection membership display
- ✅ Download original file
- ✅ Animated expand/collapse

### TagEditor

- ✅ Reusable Tag components
- ✅ Two size variants (default/compact)
- ✅ Search existing tags
- ✅ Create new tags with color picker
- ✅ Add/remove tags from media
- ✅ Real-time preview
- ✅ Loading states

### Tag Components

- ✅ Accessible color contrast
- ✅ Hover states and transitions
- ✅ Support for both light and dark themes
- ✅ Responsive design
- ✅ TypeScript support
- ✅ Customizable styling

## Performance Optimizations

1. **Lazy Loading**: Media data is fetched only when modal opens
2. **Image Preloading**: Adjacent images are preloaded for smooth navigation
3. **Progressive Loading**: Images load progressively from thumbnail to full resolution
4. **Memory Management**: Full media data is cleared when modal closes
5. **Component Reusability**: Tag components can be used throughout the application
6. **Modular Structure**: Components can be imported individually to reduce bundle size

## Keyboard Shortcuts

- `Escape`: Close modal
- `←` / `→`: Navigate between media items
- `Delete`: Show delete confirmation
- `i`: Toggle metadata sidebar
- `r`: Reset zoom/pan
- `+` / `-`: Zoom in/out

## Dependencies

- React 18+
- GSAP (animations)
- Tailwind CSS (styling)
- TypeScript
