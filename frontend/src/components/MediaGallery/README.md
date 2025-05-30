# MediaGallery Component

A high-performance media gallery component optimized for handling large collections (100,000+ images) with instant loading and smooth user experience.

## Key Features

### 🚀 Performance Optimizations

- **Virtual Scrolling**: Only renders visible items using `react-window`
- **Progressive Image Loading**: Blur placeholders → Sharp thumbnails → Full resolution
- **Multiple Thumbnail Sizes**: Micro (20px), Small (200px), Medium (400px), Large (800px)
- **WebP Compression**: Optimized thumbnails with 85-95% quality
- **Aggressive Caching**: 1-year cache for thumbnails, 1-hour for originals
- **Lazy Loading**: Images load only when entering viewport
- **Blur Hash Placeholders**: Instant color previews using BlurHash algorithm

### 🎨 Visual Features

- **Instant Blur Placeholders**: Show image colors immediately using BlurHash
- **Smooth Transitions**: Blur-to-sharp animation (300ms duration)
- **Responsive Grid**: Adapts to container width with optimal column count
- **Selection Mode**: Multi-select with visual feedback
- **Hover Overlays**: File info on hover (for cards ≥115px wide)

### 📱 User Experience

- **Keyboard Shortcuts**: 'S' for selection mode, 'Escape' to exit
- **Touch Support**: Mobile-optimized interactions
- **Loading States**: Visual feedback during operations
- **Error Handling**: Graceful fallbacks for failed loads
- **Infinite Scroll**: Automatic loading of more items

## Component Structure

```
MediaGallery/
├── index.ts              # Main exports
├── README.md             # This documentation
├── GridItem.tsx          # Virtual grid item renderer
├── ListView.tsx          # List view implementation
├── LoadingState.tsx      # Loading placeholder
├── ErrorState.tsx        # Error display
├── EmptyState.tsx        # Empty gallery state
└── NotificationToast.tsx # Toast notifications
```

## Thumbnail System

### Backend Optimization

The backend generates multiple thumbnail sizes using Sharp:

```typescript
// Thumbnail sizes generated
micro: 20x20px (blur hash preview)
small: 200x200px (grid small)
medium: 400x400px (grid medium)
large: 800x800px (grid large & modal)
```

### Frontend Loading Strategy

1. **Instant**: Show BlurHash placeholder (decoded from 20-100 byte string)
2. **Fast**: Load appropriate thumbnail size based on container width
3. **Progressive**: Fade from blur to sharp image with smooth transition
4. **Cached**: Browser caches thumbnails for 1 year

### Size Selection Logic

```typescript
// Automatic size selection based on card width
cardWidth <= 150px  → small (200px)
cardWidth <= 300px  → medium (400px)
cardWidth > 300px   → large (800px)
```

## Usage Examples

### Basic Usage

```tsx
import { MediaGallery } from "@/components/MediaGallery";

<MediaGallery filters={filters} viewMode={{ type: "grid", size: "medium" }} />;
```

### With Custom Filters

```tsx
const filters = {
  search: "vacation",
  selectedTags: ["travel", "2024"],
  mimeType: "image/",
  sortBy: "dateTaken",
  sortOrder: "desc",
};

<MediaGallery filters={filters} viewMode={viewMode} />;
```

## Performance Metrics

### Optimized for Scale

- **100,000+ images**: Smooth scrolling with virtual rendering
- **Memory efficient**: Only loads visible thumbnails
- **Network optimized**: WebP compression reduces bandwidth by 25-35%
- **Cache friendly**: Aggressive caching reduces server load

### Loading Times

- **Blur placeholder**: Instant (0ms)
- **Thumbnail load**: 50-200ms (depending on size/network)
- **Transition**: 300ms smooth fade
- **Total perceived load**: <100ms for cached items

## Browser Support

- **Modern browsers**: Full feature support
- **Safari**: WebP support via polyfill
- **Mobile**: Touch-optimized interactions
- **Accessibility**: Screen reader compatible

## Development

### Adding New Thumbnail Sizes

1. Update `ThumbnailSizes` interface in `thumbnailService.ts`
2. Add size to backend route handler
3. Update frontend `OptimizedImage` component
4. Run migration to regenerate existing thumbnails

### Debugging Performance

Use browser dev tools to monitor:

- Network tab: Thumbnail loading efficiency
- Performance tab: Scroll performance
- Memory tab: Memory usage during scrolling

## Migration

To add blur hash support to existing installations:

```bash
# Backend: Add blur_hash column and generate hashes
npm run migrate:blurhash

# This will:
# 1. Add blur_hash column to media_files table
# 2. Generate blur hashes for existing images
# 3. Create optimized WebP thumbnails
```

## Features

### Enhanced Date Sorting

- **Photo Date Sorting**: Sort by the actual date the image was taken (extracted from EXIF data)
- **Upload Date Sorting**: Sort by when the file was uploaded to the system
- **Smart Fallback**: When photo date is not available, falls back to upload date
- **Visual Indicators**: Clear icons (📷 for photo date, 📤 for upload date) throughout the UI

### Sorting Options

- **Photo Date** (`dateTaken`): Uses EXIF DateTimeOriginal or DateTime fields
- **Upload Date** (`createdAt`): Uses file upload timestamp
- **File Name** (`filename`): Alphabetical sorting
- **File Size** (`fileSize`): Size-based sorting
- **Order**: Ascending or Descending for all sort options

### View Modes

- **Grid View**: Responsive grid with configurable item sizes (Small, Medium, Large)
- **List View**: Detailed list view with metadata
- **Virtual Scrolling**: Efficient rendering of large media collections

### Selection & Actions

- **Multi-selection Mode**: Select multiple items for batch operations
- **Keyboard Shortcuts**: Quick navigation and selection
- **Bulk Operations**: Delete multiple items at once

### Advanced Features

- **Infinite Scrolling**: Load more items as you scroll
- **Search Integration**: Real-time search with filtering
- **EXIF Data Support**: Automatic extraction and display of camera metadata
- **Responsive Design**: Works on desktop and mobile devices

## Usage

```tsx
import { MediaGallery } from "@/components/MediaGallery";

function MyApp() {
  const [filters, setFilters] = useState({
    search: "",
    selectedTags: [],
    selectedCollections: [],
    mimeType: "",
    sortBy: "dateTaken", // Default to photo date
    sortOrder: "desc",
  });

  const [viewMode, setViewMode] = useState({
    type: "grid",
    size: "medium",
  });

  return <MediaGallery filters={filters} viewMode={viewMode} />;
}
```

## Filter Configuration

### Sort Options

- `dateTaken`: Sort by photo capture date (EXIF data)
- `createdAt`: Sort by upload date
- `updatedAt`: Sort by last modified date
- `filename`: Sort alphabetically by filename
- `fileSize`: Sort by file size

### Sort Order

- `desc`: Newest/Largest first
- `asc`: Oldest/Smallest first

## EXIF Data Integration

The gallery automatically extracts and uses EXIF data for enhanced sorting:

1. **Automatic Extraction**: EXIF data is extracted when images are uploaded
2. **Manual Re-extraction**: Users can manually trigger EXIF extraction
3. **Smart Sorting**: Photo date sorting uses EXIF DateTimeOriginal or DateTime
4. **Graceful Fallback**: Falls back to upload date when EXIF data is unavailable

## Performance Optimizations

- **Virtual Scrolling**: Only renders visible items
- **Image Optimization**: Automatic thumbnail generation and serving
- **Lazy Loading**: Images load as they come into view
- **Efficient Queries**: Backend optimized for large datasets

## Date Display Logic

The gallery intelligently displays date information:

1. **Photo Date Priority**: If EXIF data contains DateTimeOriginal, display with 📷 icon
2. **Upload Date Fallback**: If no EXIF date, display upload date with 📤 icon
3. **Consistent Formatting**: All dates formatted consistently (e.g., "Dec 15, 2023")
4. **Visual Distinction**: Clear visual indicators help users understand data source

## Backend Integration

The component works with the enhanced backend API that supports:

- **EXIF-aware Sorting**: Database queries that join with exif_data table when needed
- **Optimized Queries**: Different query strategies for gallery vs. detail views
- **Fallback Sorting**: `COALESCE(e.date_taken, m.created_at)` for reliable sorting

## Best Practices

1. **Default to Photo Date**: Set `sortBy: "dateTaken"` for photo-centric applications
2. **Provide Sort Options**: Give users control over sorting via sidebar or header controls
3. **Extract EXIF Early**: Trigger EXIF extraction during upload for best performance
4. **Use Visual Indicators**: Help users understand whether they're seeing photo or upload dates
5. **Handle Missing Data**: Always provide fallbacks for missing EXIF data
