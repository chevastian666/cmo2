/**
 * Virtualized List Component
 * High-performance list rendering for millions of items
 * By Cheva
 */

import React, { useCallback, useRef, useMemo, memo } from 'react';

import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { cn} from '@/utils/utils';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight?: number | ((index: number) => number);
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  loadMore?: (startIndex: number, stopIndex: number) => Promise<void>;
  hasNextPage?: boolean;
  isItemLoaded?: (index: number) => boolean;
  threshold?: number;
  overscan?: number;
  estimatedItemSize?: number;
  className?: string;
  onScroll?: (scrollOffset: number) => void;
  initialScrollOffset?: number;
  width?: number | string;
  height?: number | string;
}

// Memoized row component to prevent unnecessary re-renders
const Row = memo(({ data, index, style }: unknown) => {
  
  const item = items[index];
  
  if (!item) {
    return (
      <div style={style} className="flex items-center justify-center">
        <div className="animate-pulse bg-gray-700 h-16 w-full rounded-lg" />
      </div>
    );
  }
  
  return <div style={style}>{renderItem(item, index, style)}</div>;
});

Row.displayName = 'VirtualizedRow';

export function VirtualizedList<T>({
  items, itemHeight = 80, renderItem, loadMore, hasNextPage = false, isItemLoaded = (index: number) => !!items[index],
  threshold = 15,
  overscan = 5,
  estimatedItemSize = 80,
  className,
  onScroll,
  initialScrollOffset = 0,
  width = '100%',
  height = '100%'
}: VirtualizedListProps<T>) {
  const listRef = useRef<List>(null);
  const itemCount = hasNextPage ? items.length + 1 : items.length;

  // Get item size - supports both fixed and variable heights
  const getItemSize = useCallback((index: number) => {
    if (typeof itemHeight === 'function') {
      return itemHeight(index);
    }
    return itemHeight;
  }, [itemHeight]);

  // Memoize item data to prevent unnecessary re-renders
  const itemData = useMemo(() => ({
    items,
    renderItem
  }), [items, renderItem]);

  // Handle scroll events with throttling
  const handleScroll = useCallback(({ scrollOffset }: { scrollOffset: number }) => {
    if (onScroll) {
      onScroll(scrollOffset);
    }
  }, [onScroll]);

  // Reset scroll position when items change significantly
  const resetScroll = useCallback(() => {
    listRef.current?.scrollToItem(0);
  }, []);

  // Scroll to specific item
  const scrollToItem = useCallback((index: number, align: 'start' | 'center' | 'end' = 'start') => {
    listRef.current?.scrollToItem(index, align);
  }, []);

  // Inner list component
  const InnerList = useCallback(({ height, width }: { height: number; width: number }) => {
    if (loadMore && hasNextPage) {
      return (<InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={itemCount}
          loadMoreItems={loadMore}
          threshold={threshold}
        >
          {({ onItemsRendered, ref }) => (<List
              ref={(list) => {
                ref(list);
                // @ts-ignore
                listRef.current = list;
              }}
              height={height}
              width={width}
              itemCount={itemCount}
              itemSize={getItemSize}
              itemData={itemData}
              onScroll={handleScroll}
              overscanCount={overscan}
              estimatedItemSize={estimatedItemSize}
              initialScrollOffset={initialScrollOffset}
              className="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
            >
              {Row}
            </List>
          )}
        </InfiniteLoader>
      );
    }

    return (
      <List
        ref={listRef}
        height={height}
        width={width}
        itemCount={itemCount}
        itemSize={getItemSize}
        itemData={itemData}
        onScroll={handleScroll}
        overscanCount={overscan}
        estimatedItemSize={estimatedItemSize}
        initialScrollOffset={initialScrollOffset}
        className="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
      >
        {Row}
      </List>
    );
  }, [
    loadMore,
    hasNextPage,
    isItemLoaded,
    itemCount,
    getItemSize,
    itemData,
    handleScroll,
    overscan,
    estimatedItemSize,
    initialScrollOffset,
    threshold
  ]);

  return (
    <div className={cn("w-full h-full", className)} style={{ width, height }}>
      <AutoSizer>
        {({ height, width }) => (
          <InnerList height={height} width={width} />
        )}
      </AutoSizer>
    </div>
  );
}

// Export utility functions
export const VirtualizedListUtils = {
  // Calculate optimal item height based on content
  calculateItemHeight: (content: string, maxWidth: number, fontSize = 14): number => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return 80;

    context.font = `${fontSize}px sans-serif`;
    const metrics = context.measureText(content);
    const lines = Math.ceil(metrics.width / maxWidth);
    
    return Math.max(80, lines * (fontSize * 1.5) + 40); // padding
  },

  // Create index map for quick lookups
  createIndexMap: <T extends { id: string }>(items: T[]): Map<string, number> => {
    const map = new Map<string, number>();
    items.forEach((item, index) => {
      map.set(item.id, index);
    });
    return map;
  },

  // Binary search for sorted lists
  binarySearch: <T,>(items: T[], target: T, compareFn: (a: T, b: T) => number): number => {
    let left = 0;
    let right = items.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const comparison = compareFn(items[mid], target);

      if (comparison === 0) return mid;
      if (comparison < 0) left = mid + 1;
      else right = mid - 1;
    }

    return -1;
  }
};