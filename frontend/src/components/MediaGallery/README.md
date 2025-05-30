# MediaGallery Component Architecture

The MediaGallery component has been refactored into a modular architecture for better maintainability, performance, and reusability.

## Structure

### Main Component

- `MediaGallery.tsx` - Main orchestrating component (reduced from 744 to ~280 lines)

### Sub-components

- `GridItem.tsx` - Individual grid item with selection and loading logic
- `ListView.tsx` - List view rendering component
- `LoadingState.tsx` - Loading skeleton component
- `ErrorState.tsx` - Error state display component
- `EmptyState.tsx` - Empty state display component
- `NotificationToast.tsx` - Notification display component

### Custom Hooks

- `useSelection.ts` - Manages selection mode and selected items
- `useKeyboardShortcuts.ts` - Handles keyboard shortcuts
- `useNotifications.ts` - Manages notification state and auto-dismiss
- `useMediaModal.ts` - Manages modal state and navigation

### Utilities

- `gridCalculations.ts` - Grid size and column calculation functions

## Benefits

### Performance Optimizations

1. **Separated concerns** - Each component handles a single responsibility
2. **Memoized calculations** - Grid calculations extracted to utilities
3. **Custom hooks** - Logic reuse and better state management
4. **Virtual scrolling** - Maintained for grid view performance

### Code Quality Improvements

1. **Reduced complexity** - Main component is much smaller and focused
2. **Reusable logic** - Hooks can be used in other components
3. **Better testing** - Each piece can be tested independently
4. **Type safety** - Proper TypeScript interfaces throughout

### Maintainability

1. **Single responsibility** - Each file has a clear purpose
2. **Easy to modify** - Changes to specific features are isolated
3. **Better organization** - Related functionality is grouped together
4. **Documentation** - Clear structure and interfaces

## Usage

The main MediaGallery component is used exactly the same way as before:

```tsx
<MediaGallery filters={filters} viewMode={viewMode} />
```

All the complexity is now hidden behind clean abstractions and the public API remains unchanged.

## File Dependencies

```
MediaGallery.tsx
├── hooks/
│   ├── useSelection.ts
│   ├── useKeyboardShortcuts.ts
│   ├── useNotifications.ts
│   └── useMediaModal.ts
├── utils/
│   └── gridCalculations.ts
└── MediaGallery/
    ├── GridItem.tsx
    ├── ListView.tsx
    ├── LoadingState.tsx
    ├── ErrorState.tsx
    ├── EmptyState.tsx
    └── NotificationToast.tsx
```

This architecture makes the codebase much more maintainable while improving performance and keeping the same user experience.
