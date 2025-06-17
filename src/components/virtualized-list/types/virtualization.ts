export interface VirtualizedAlertListProps {
  alerts: Alert[];
  itemHeight: number | ((index: number) => number);
  containerHeight: number;
  overscan?: number;
  onItemClick?: (alert: Alert, index: number) => void;
  onLoadMore?: () => Promise<Alert[]>;
  groupingOptions?: GroupingOptions;
  filters?: AlertFilters;
  className?: string;
}

export interface VirtualListState {
  scrollTop: number;
  visibleRange: [number, number];
  cachedHeights: Map<number, number>;
  prefetchedItems: Set<number>;
  isScrolling: boolean;
  scrollDirection: 'up' | 'down' | null;
  scrollVelocity: number;
}

export interface GroupingOptions {
  groupBy: 'timestamp' | 'severity' | 'location' | 'status';
  timeGranularity?: 'hour' | 'day' | 'week';
  collapsible: boolean;
  showCounts: boolean;
}

export interface ScrollMetrics {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  scrollVelocity: number;
  direction: 'up' | 'down' | null;
  timestamp: number;
}

export interface VirtualizedListConfig {
  performance: {
    overscanCount: number;
    prefetchThreshold: number;
    recycleThreshold: number;
    maxCacheSize: number;
    scrollDebounceMs: number;
    scrollThrottleMs: number;
  };
  scrolling: {
    smoothScrollDuration: number;
    momentumScrolling: boolean;
    snapToItems: boolean;
    touchScrollMultiplier: number;
  };
  accessibility: {
    announceItemChanges: boolean;
    keyboardNavigation: boolean;
    screenReaderOptimized: boolean;
  };
}

export interface ItemRenderer<T> {
  (props: {
    item: T;
    index: number;
    style: React.CSSProperties;
    isScrolling: boolean;
  }): React.ReactElement;
}

import type { Alert } from './alerts';