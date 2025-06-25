/**
 * Virtualized List Component
 * High-performance list rendering for millions of items
 * By Cheva
 */

import React, { useCallback, useRef, useMemo, memo } from 'react'
import { VariableSizeList as List } from 'react-window'

import InfiniteLoader from 'react-window-infinite-loader'
import AutoSizer from 'react-virtualized-auto-sizer'
import { cn} from '@/utils/utils'
interface VirtualizedListProps<T> {
  items: T[]
  itemHeight?: number | ((index: number) => number)
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode
  loadMore?: (startIndex: number, stopIndex: number) => Promise<void>
  hasNextPage?: boolean
  isItemLoaded?: (index: number) => boolean
  threshold?: number
  overscan?: number
  estimatedItemSize?: number
  className?: string
  onScroll?: (scrollOffset: number) => void
  initialScrollOffset?: number
  width?: number | string
  height?: number | string
}

// Row component interface
interface RowProps<T> {
  data: {
    items: T[]
    renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode
  }
  index: number
  style: React.CSSProperties
}

// Memoized row component to prevent unnecessary re-renders
const Row = memo(<T,>({ data, index, style }: RowProps<T>) => {
  const { items, renderItem } = data
  const item = items[index]
  
  if (!item) {
    return (
      <div style={style} className="flex items-center justify-center">
        <div className="animate-pulse bg-gray-700 h-16 w-full rounded-lg" />
      </div>
    )
  }
  
  return <div style={style}>{renderItem(item, index, style)}</div>
})
Row.displayName = 'VirtualizedRow'
export function VirtualizedList<T>({
  items, itemHeight = 80, renderItem, loadMore, hasNextPage = false, isItemLoaded: _isItemLoaded = (index: number) => !!items[index],
  threshold: _threshold = 15,
  overscan: _overscan = 5,
  estimatedItemSize: _estimatedItemSize = 80,
  className,
  onScroll,
  initialScrollOffset: _initialScrollOffset = 0,
  width = '100%',
  height = '100%'
}: VirtualizedListProps<T>) {
  const listRef = useRef<List>(null)
  const _itemCount = hasNextPage ? items.length + 1 : items.length
  // Get item size - supports both fixed and variable heights
  const _getItemSize = useCallback((index: number) => {
    if (typeof itemHeight === 'function') {
      return itemHeight(index)
    }
    return itemHeight
  }, [itemHeight])
  // Memoize item data to prevent unnecessary re-renders
  const _itemData = useMemo(() => ({
    items,
    renderItem
  }), [items, renderItem])
  // Handle scroll events with throttling
  const _handleScroll = useCallback(({ scrollOffset }: { scrollOffset: number }) => {
    if (onScroll) {
      onScroll(scrollOffset)
    }
  }, [onScroll])
  // Reset scroll position when items change significantly
  // const resetScroll = useCallback(() => {
  //   listRef.current?.scrollToItem(0)
  // }, [])
  // Scroll to specific item
  // const scrollToItem = useCallback((index: number, align: 'start' | 'center' | 'end' = 'start') => {
  //   listRef.current?.scrollToItem(index, align)
  // }, [])
  
  // Export methods via ref
  // Inner list component
  const InnerList = useCallback(({ height: _height, width: _width }: { height: number; width: number }) => {
    if (loadMore && hasNextPage) {
      return (<InfiniteLoader
          isItemLoaded={_isItemLoaded}
          itemCount={_itemCount}
          loadMoreItems={loadMore || (() => Promise.resolve())}
          threshold={_threshold}
        >
          {({ onItemsRendered, ref }: { onItemsRendered: (props: { overscanStartIndex: number; overscanStopIndex: number; visibleStartIndex: number; visibleStopIndex: number }) => void; ref: (instance: List | null) => void }) => (<List
              ref={(list) => {
                ref(list)
                listRef.current = list
              }}
              height={_height}
              width={_width}
              itemCount={_itemCount}
              itemSize={_getItemSize}
              itemData={_itemData as { items: unknown[]; renderItem: (item: unknown, index: number, style: React.CSSProperties) => React.ReactNode }}
              onScroll={_handleScroll}
              overscanCount={_overscan}
              estimatedItemSize={_estimatedItemSize}
              initialScrollOffset={_initialScrollOffset}
              onItemsRendered={onItemsRendered}
              className="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
            >
              {Row as React.ComponentType<{ data: typeof _itemData; index: number; style: React.CSSProperties }>}
            </List>
          )}
        </InfiniteLoader>
      )
    }

    return (
      <List
        ref={listRef}
        height={_height}
        width={_width}
        itemCount={_itemCount}
        itemSize={_getItemSize}
        itemData={_itemData as { items: unknown[]; renderItem: (item: unknown, index: number, style: React.CSSProperties) => React.ReactNode }}
        onScroll={_handleScroll}
        overscanCount={_overscan}
        estimatedItemSize={_estimatedItemSize}
        initialScrollOffset={_initialScrollOffset}
        className="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
      >
        {Row}
      </List>
    )
  }, [_estimatedItemSize, _getItemSize, _handleScroll, _initialScrollOffset, _isItemLoaded, _itemCount, _itemData, hasNextPage, loadMore, _overscan, _threshold])
  return (
    <div className={cn("w-full h-full", className)} style={{ width, height }}>
      <AutoSizer>
        {({ height, width: _width }) => (
          <InnerList height={height} width={_width} />
        )}
      </AutoSizer>
    </div>
  )
}

