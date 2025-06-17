import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { 
  calculateVisibleRange, 
  calculateTotalHeight,
  calculateScrollVelocity,
  calculatePrefetchRange,
  VisibleRange
} from '../utils/scrollCalculations';
import { ScrollPredictor } from '../utils/prefetchStrategies';
import { VirtualListMemoryManager } from '../utils/memoryManager';
import { PerformanceMonitor } from '../utils/performanceMonitor';
import type { VirtualListState, VirtualizedListConfig } from '../types/virtualization';

interface UseVirtualizationProps {
  items: any[];
  itemHeight: number | ((index: number) => number);
  containerHeight: number;
  overscan?: number;
  config?: Partial<VirtualizedListConfig>;
  onScroll?: (scrollTop: number) => void;
}

const defaultConfig: VirtualizedListConfig = {
  performance: {
    overscanCount: 3,
    prefetchThreshold: 0.8,
    recycleThreshold: 100,
    maxCacheSize: 1000,
    scrollDebounceMs: 10,
    scrollThrottleMs: 16
  },
  scrolling: {
    smoothScrollDuration: 300,
    momentumScrolling: true,
    snapToItems: false,
    touchScrollMultiplier: 1.5
  },
  accessibility: {
    announceItemChanges: true,
    keyboardNavigation: true,
    screenReaderOptimized: false
  }
};

export function useVirtualization({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
  config: userConfig,
  onScroll
}: UseVirtualizationProps) {
  const config = useMemo(() => ({
    ...defaultConfig,
    ...userConfig,
    performance: { ...defaultConfig.performance, ...userConfig?.performance },
    scrolling: { ...defaultConfig.scrolling, ...userConfig?.scrolling },
    accessibility: { ...defaultConfig.accessibility, ...userConfig?.accessibility }
  }), [userConfig]);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPredictor = useRef(new ScrollPredictor());
  const memoryManager = useRef(new VirtualListMemoryManager(config.performance.recycleThreshold));
  const performanceMonitor = useRef(new PerformanceMonitor());
  const scrollTimeout = useRef<NodeJS.Timeout>();
  const lastScrollTime = useRef(0);
  const lastScrollTop = useRef(0);
  const isScrolling = useRef(false);

  // State
  const [state, setState] = useState<VirtualListState>({
    scrollTop: 0,
    visibleRange: [0, Math.min(20, items.length - 1)],
    cachedHeights: new Map(),
    prefetchedItems: new Set(),
    isScrolling: false,
    scrollDirection: null,
    scrollVelocity: 0
  });

  // Calculate total height
  const totalHeight = useMemo(() => 
    calculateTotalHeight(items.length, itemHeight, state.cachedHeights),
    [items.length, itemHeight, state.cachedHeights]
  );

  // Calculate visible items
  const visibleItems = useMemo(() => {
    const [start, end] = state.visibleRange;
    return items.slice(start, end + 1).map((item, index) => ({
      item,
      index: start + index,
      style: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        transform: `translateY(${getItemOffset(start + index)}px)`,
        height: typeof itemHeight === 'function' ? itemHeight(start + index) : itemHeight
      }
    }));
  }, [items, state.visibleRange, itemHeight]);

  // Get item offset
  const getItemOffset = useCallback((index: number): number => {
    if (typeof itemHeight === 'number') {
      return index * itemHeight;
    }

    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += state.cachedHeights.get(i) ?? itemHeight(i);
    }
    return offset;
  }, [itemHeight, state.cachedHeights]);

  // Handle scroll with performance optimization
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const now = performance.now();
    
    // Calculate scroll metrics
    const deltaTime = now - lastScrollTime.current;
    const velocity = calculateScrollVelocity(scrollTop, lastScrollTop.current, deltaTime);
    const direction = velocity > 0 ? 'down' : velocity < 0 ? 'up' : null;

    // Update refs
    lastScrollTime.current = now;
    lastScrollTop.current = scrollTop;
    isScrolling.current = true;

    // Analyze scroll pattern
    scrollPredictor.current.analyzeScrollPattern(scrollTop, now);

    // Clear existing timeout
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    // Throttled update
    const updateVisibleRange = () => {
      performanceMonitor.current.measureRender(() => {
        const visibleRange = calculateVisibleRange(
          scrollTop,
          containerHeight,
          items.length,
          itemHeight,
          overscan
        );

        // Calculate prefetch range
        const [prefetchStart, prefetchEnd] = calculatePrefetchRange(
          visibleRange,
          direction,
          velocity,
          items.length,
          config.performance.prefetchThreshold
        );

        // Update prefetched items
        const newPrefetchedItems = new Set<number>();
        for (let i = prefetchStart; i <= prefetchEnd; i++) {
          newPrefetchedItems.add(i);
        }

        setState(prev => ({
          ...prev,
          scrollTop,
          visibleRange: [visibleRange.startIndex, visibleRange.endIndex],
          prefetchedItems: newPrefetchedItems,
          isScrolling: true,
          scrollDirection: direction,
          scrollVelocity: velocity
        }));
      });

      // Measure scroll latency
      const latency = performance.now() - now;
      performanceMonitor.current.measureScrollLatency(latency);
    };

    // Apply throttling based on performance
    if (deltaTime >= config.performance.scrollThrottleMs) {
      updateVisibleRange();
    }

    // Debounced scroll end detection
    scrollTimeout.current = setTimeout(() => {
      isScrolling.current = false;
      setState(prev => ({ ...prev, isScrolling: false }));
    }, 150);

    // Call user's onScroll handler
    onScroll?.(scrollTop);
  }, [containerHeight, items.length, itemHeight, overscan, config.performance, onScroll]);

  // Scroll to item
  const scrollToItem = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    if (!containerRef.current) return;

    const offset = getItemOffset(index);
    containerRef.current.scrollTo({
      top: offset,
      behavior
    });
  }, [getItemOffset]);

  // Scroll to offset
  const scrollToOffset = useCallback((offset: number, behavior: ScrollBehavior = 'smooth') => {
    if (!containerRef.current) return;

    containerRef.current.scrollTo({
      top: offset,
      behavior
    });
  }, []);

  // Update item height cache
  const updateItemHeight = useCallback((index: number, height: number) => {
    setState(prev => {
      const newCachedHeights = new Map(prev.cachedHeights);
      newCachedHeights.set(index, height);
      return { ...prev, cachedHeights: newCachedHeights };
    });
  }, []);

  // Get performance metrics
  const getPerformanceMetrics = useCallback(() => {
    const recycleStats = memoryManager.current.getStats();
    return performanceMonitor.current.getMetrics({
      itemsRendered: state.visibleRange[1] - state.visibleRange[0] + 1,
      cacheHitRate: recycleStats.hitRate,
      recycleRate: recycleStats.recycled / (recycleStats.created || 1)
    });
  }, [state.visibleRange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      memoryManager.current.cleanup();
      performanceMonitor.current.destroy();
      scrollPredictor.current.reset();
    };
  }, []);

  return {
    containerRef,
    containerProps: {
      ref: containerRef,
      onScroll: handleScroll,
      style: {
        position: 'relative' as const,
        height: containerHeight,
        overflow: 'auto',
        willChange: 'scroll-position',
        contain: 'strict'
      }
    },
    scrollerProps: {
      style: {
        height: totalHeight,
        position: 'relative' as const,
        willChange: 'contents'
      }
    },
    visibleItems,
    state,
    scrollToItem,
    scrollToOffset,
    updateItemHeight,
    getPerformanceMetrics,
    isScrolling: state.isScrolling,
    scrollDirection: state.scrollDirection
  };
}