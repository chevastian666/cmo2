import React, { useCallback, useRef, useState, useEffect, memo } from 'react';
import { cn } from '../../utils/utils';

export interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

export const VirtualizedList = memo(<T extends any>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className,
  onScroll
}: VirtualizedListProps<T>) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const newScrollTop = scrollContainerRef.current.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);
    }
  }, [onScroll]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return (
    <div
      ref={scrollContainerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
              className="virtualized-item"
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}) as <T>(props: VirtualizedListProps<T>) => JSX.Element;

VirtualizedList.displayName = 'VirtualizedList';

// Virtualized Table Component
export interface VirtualizedTableProps<T> {
  items: T[];
  columns: Array<{
    key: string;
    header: string;
    width?: string;
    render?: (item: T) => React.ReactNode;
  }>;
  rowHeight?: number;
  containerHeight?: number;
  onRowClick?: (item: T, index: number) => void;
  className?: string;
  headerClassName?: string;
  rowClassName?: string | ((item: T, index: number) => string);
}

export const VirtualizedTable = memo(<T extends Record<string, any>>({
  items,
  columns,
  rowHeight = 60,
  containerHeight = 600,
  onRowClick,
  className,
  headerClassName,
  rowClassName
}: VirtualizedTableProps<T>) => {
  const renderRow = useCallback((item: T, index: number) => {
    const rowClass = typeof rowClassName === 'function' 
      ? rowClassName(item, index) 
      : rowClassName;

    return (
      <div
        className={cn(
          'flex items-center border-b border-gray-700 hover:bg-gray-700/50 transition-colors cursor-pointer',
          rowClass
        )}
        onClick={() => onRowClick?.(item, index)}
        style={{ height: rowHeight }}
      >
        {columns.map((column) => (
          <div
            key={column.key}
            className="px-4 py-2 overflow-hidden text-ellipsis whitespace-nowrap"
            style={{ width: column.width || `${100 / columns.length}%` }}
          >
            {column.render ? column.render(item) : item[column.key]}
          </div>
        ))}
      </div>
    );
  }, [columns, onRowClick, rowClassName, rowHeight]);

  return (
    <div className={cn('bg-gray-800 rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div className={cn(
        'flex items-center bg-gray-900 border-b border-gray-700 sticky top-0 z-10',
        headerClassName
      )}>
        {columns.map((column) => (
          <div
            key={column.key}
            className="px-4 py-3 font-semibold text-gray-300 text-sm uppercase tracking-wider"
            style={{ width: column.width || `${100 / columns.length}%` }}
          >
            {column.header}
          </div>
        ))}
      </div>

      {/* Virtualized Body */}
      <VirtualizedList
        items={items}
        itemHeight={rowHeight}
        containerHeight={containerHeight}
        renderItem={renderRow}
        className="virtualized-table-body"
      />
    </div>
  );
}) as <T extends Record<string, any>>(props: VirtualizedTableProps<T>) => JSX.Element;

VirtualizedTable.displayName = 'VirtualizedTable';