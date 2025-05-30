import { useState } from "react";
import { MediaFile } from "@/types";

export function useMediaModal(mediaFiles: MediaFile[]) {
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (media: MediaFile) => {
    setSelectedMedia(media);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMedia(null);
  };

  const navigateToMedia = (direction: "previous" | "next") => {
    if (!selectedMedia) return;

    const currentIndex = mediaFiles.findIndex((m) => m.id === selectedMedia.id);
    if (currentIndex === -1) return;

    const newIndex =
      direction === "previous" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < mediaFiles.length) {
      setSelectedMedia(mediaFiles[newIndex]);
    }
  };

  const currentIndex = selectedMedia
    ? mediaFiles.findIndex((m) => m.id === selectedMedia.id)
    : -1;

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < mediaFiles.length - 1;

  return {
    selectedMedia,
    isModalOpen,
    openModal,
    closeModal,
    navigateToMedia,
    hasPrevious,
    hasNext,
    mediaFiles,
  };
}
