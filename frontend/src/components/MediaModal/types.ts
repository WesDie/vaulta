import { MediaFile } from "@/types";

export interface MediaModalProps {
  media: MediaFile | null;
  isOpen: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onDelete?: (mediaId: string) => void;
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
  imageContainerHeight?: number;
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
  onDelete?: () => void;
}

export interface ZoomIndicatorProps {
  scale: number;
  isVisible: boolean;
}
