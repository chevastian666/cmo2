/**
 * Utility functions for virtual scrolling calculations
 */

export interface VisibleRange {
  startIndex: number;
  endIndex: number;
  offsetY: number;
}

/**
 * Calculate visible range of items based on scroll position
 */
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemCount: number,
  itemHeight: number | ((index: number) => number),
  overscan: number = 3
): VisibleRange {
  if (typeof itemHeight === 'number') {
    // Fixed height optimization
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    const offsetY = startIndex * itemHeight;

    return { startIndex, endIndex, offsetY };
  } else {
    // Variable height calculation
    return calculateVariableHeightRange(
      scrollTop,
      containerHeight,
      itemCount,
      itemHeight,
      overscan
    );
  }
}

/**
 * Calculate range for variable height items
 */
function calculateVariableHeightRange(
  scrollTop: number,
  containerHeight: number,
  itemCount: number,
  getItemHeight: (index: number) => number,
  overscan: number
): VisibleRange {
  let accumulatedHeight = 0;
  let startIndex = 0;
  let offsetY = 0;

  // Find start index
  for (let i = 0; i < itemCount; i++) {
    const height = getItemHeight(i);
    if (accumulatedHeight + height > scrollTop) {
      startIndex = Math.max(0, i - overscan);
      break;
    }
    accumulatedHeight += height;
  }

  // Calculate offset
  accumulatedHeight = 0;
  for (let i = 0; i < startIndex; i++) {
    accumulatedHeight += getItemHeight(i);
  }
  offsetY = accumulatedHeight;

  // Find end index
  accumulatedHeight = 0;
  let endIndex = startIndex;
  for (let i = startIndex; i < itemCount; i++) {
    if (accumulatedHeight > containerHeight + overscan * 50) {
      endIndex = i;
      break;
    }
    accumulatedHeight += getItemHeight(i);
  }
  endIndex = Math.min(itemCount - 1, endIndex + overscan);

  return { startIndex, endIndex, offsetY };
}

/**
 * Calculate total height of all items
 */
export function calculateTotalHeight(
  itemCount: number,
  itemHeight: number | ((index: number) => number),
  cachedHeights?: Map<number, number>
): number {
  if (typeof itemHeight === 'number') {
    return itemCount * itemHeight;
  }

  let totalHeight = 0;
  for (let i = 0; i < itemCount; i++) {
    const height = cachedHeights?.get(i) ?? itemHeight(i);
    totalHeight += height;
  }
  return totalHeight;
}

/**
 * Binary search to find item at specific scroll position
 */
export function findItemAtOffset(
  offset: number,
  itemCount: number,
  getItemHeight: (index: number) => number
): number {
  let low = 0;
  let high = itemCount - 1;
  let accumulatedHeight = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    
    // Calculate height up to mid
    accumulatedHeight = 0;
    for (let i = 0; i < mid; i++) {
      accumulatedHeight += getItemHeight(i);
    }

    const midHeight = getItemHeight(mid);
    
    if (accumulatedHeight <= offset && offset < accumulatedHeight + midHeight) {
      return mid;
    } else if (offset < accumulatedHeight) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return Math.max(0, Math.min(itemCount - 1, low));
}

/**
 * Calculate scroll velocity based on scroll events
 */
export function calculateScrollVelocity(
  currentScrollTop: number,
  previousScrollTop: number,
  deltaTime: number
): number {
  if (deltaTime === 0) return 0;
  return (currentScrollTop - previousScrollTop) / deltaTime;
}

/**
 * Estimate scroll destination based on velocity
 */
export function estimateScrollDestination(
  currentScrollTop: number,
  velocity: number,
  deceleration: number = 0.95
): number {
  // Using physics formula for deceleration
  const distance = (velocity * velocity) / (2 * (1 - deceleration));
  return currentScrollTop + distance * Math.sign(velocity);
}

/**
 * Calculate items that should be prefetched based on scroll patterns
 */
export function calculatePrefetchRange(
  visibleRange: VisibleRange,
  scrollDirection: 'up' | 'down' | null,
  scrollVelocity: number,
  itemCount: number,
  prefetchFactor: number = 2
): [number, number] {
  if (!scrollDirection) {
    return [visibleRange.startIndex, visibleRange.endIndex];
  }

  const visibleCount = visibleRange.endIndex - visibleRange.startIndex;
  const velocityFactor = Math.min(Math.abs(scrollVelocity) / 1000, 3);
  const prefetchCount = Math.ceil(visibleCount * prefetchFactor * (1 + velocityFactor));

  if (scrollDirection === 'down') {
    const prefetchStart = visibleRange.startIndex;
    const prefetchEnd = Math.min(itemCount - 1, visibleRange.endIndex + prefetchCount);
    return [prefetchStart, prefetchEnd];
  } else {
    const prefetchStart = Math.max(0, visibleRange.startIndex - prefetchCount);
    const prefetchEnd = visibleRange.endIndex;
    return [prefetchStart, prefetchEnd];
  }
}

/**
 * Smooth scroll easing function
 */
export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Calculate position for smooth scrolling
 */
export function calculateSmoothScrollPosition(
  startPosition: number,
  targetPosition: number,
  progress: number
): number {
  const distance = targetPosition - startPosition;
  return startPosition + distance * easeInOutQuad(progress);
}