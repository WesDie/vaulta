export const getItemSize = (size: string): number => {
  switch (size) {
    case "small":
      return 120;
    case "medium":
      return 180;
    case "large":
      return 250;
    default:
      return 180;
  }
};

export const getColumnsCount = (
  size: string,
  containerWidth: number
): number => {
  if (containerWidth <= 0) return 1;

  const itemSize = getItemSize(size);
  const gap = 4; // Total gap per item (2px padding on each side)
  const minColumns = 1;
  const maxColumns = 20; // Reasonable maximum

  // Calculate how many columns we can fit with gaps
  // Formula: (containerWidth + gap) / (itemSize + gap)
  // We add gap to containerWidth to account for the fact that the last item doesn't need a trailing gap
  let columns = Math.floor((containerWidth + gap) / (itemSize + gap));

  // Ensure we have at least 1 column and don't exceed maximum
  columns = Math.max(minColumns, Math.min(maxColumns, columns));

  // If we have extra space, try to fit one more column
  const totalWidthUsed = columns * itemSize + columns * gap;
  const remainingWidth = containerWidth - totalWidthUsed;

  // If we have significant remaining width (more than half an item), try to fit more
  if (remainingWidth > itemSize * 0.5 && columns < maxColumns) {
    columns += 1;
  }

  return columns;
};
