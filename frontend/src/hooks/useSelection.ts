import { useState, useEffect } from "react";
import { MediaFile } from "@/types";

export function useSelection(mediaFiles: MediaFile[]) {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Clear selection when switching out of selection mode
  useEffect(() => {
    if (!selectionMode) {
      setSelectedItems(new Set());
    }
  }, [selectionMode]);

  const toggleItemSelection = (id: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedItems(new Set(mediaFiles.map((m) => m.id)));
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const enterSelectionMode = () => {
    setSelectionMode(true);
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
  };

  return {
    selectionMode,
    selectedItems,
    toggleItemSelection,
    selectAll,
    clearSelection,
    enterSelectionMode,
    exitSelectionMode,
  };
}
