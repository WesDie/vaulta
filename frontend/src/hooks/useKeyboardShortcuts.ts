import { useEffect } from "react";

interface UseKeyboardShortcutsProps {
  selectionMode: boolean;
  selectedItemsCount: number;
  mediaFilesLength: number;
  enterSelectionMode: () => void;
  exitSelectionMode: () => void;
  selectAll: () => void;
  onBulkDelete: () => void;
}

export function useKeyboardShortcuts({
  selectionMode,
  selectedItemsCount,
  mediaFilesLength,
  enterSelectionMode,
  exitSelectionMode,
  selectAll,
  onBulkDelete,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case "s":
          if (!selectionMode && mediaFilesLength > 0) {
            event.preventDefault();
            enterSelectionMode();
          }
          break;
        case "escape":
          if (selectionMode) {
            event.preventDefault();
            exitSelectionMode();
          }
          break;
        case "a":
          if (selectionMode && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            selectAll();
          }
          break;
        case "delete":
        case "backspace":
          if (selectionMode && selectedItemsCount > 0) {
            event.preventDefault();
            onBulkDelete();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    selectionMode,
    selectedItemsCount,
    mediaFilesLength,
    enterSelectionMode,
    exitSelectionMode,
    selectAll,
    onBulkDelete,
  ]);
}
