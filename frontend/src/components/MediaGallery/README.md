# MediaGallery Component

A powerful, virtualized media gallery component for displaying images and videos with advanced filtering, sorting, and selection capabilities.

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
