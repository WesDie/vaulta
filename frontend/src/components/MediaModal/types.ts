import { MediaFile } from "@/types";

export interface MediaModalProps {
  media: MediaFile | null;
  isOpen: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface ImageTransform {
  scale: number;
  x: number;
  y: number;
}

export interface MediaViewerProps {
  media: MediaFile;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
  transform: ImageTransform;
  onTransformChange: (transform: ImageTransform) => void;
  isDragging: boolean;
  onDraggingChange: (dragging: boolean) => void;
}

export interface MetadataSidebarProps {
  media: MediaFile;
  showMetadata: boolean;
  onClose: () => void;
}

export interface MediaControlsProps {
  showMetadata: boolean;
  onToggleMetadata: () => void;
  onResetZoom: () => void;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  isImage: boolean;
}

export interface ZoomIndicatorProps {
  scale: number;
  isVisible: boolean;
}
