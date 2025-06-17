/**
 * Performance monitoring and optimization utilities
 */

import React from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
  props?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private enabled = process.env.NODE_ENV === 'development';
  private slowThreshold = 16; // 16ms = 60fps

  /**
   * Measure component render time
   */
  measureRender<T extends React.ComponentType<any>>(
    Component: T,
    componentName: string
  ): T {
    if (!this.enabled) return Component;

    const MeasuredComponent = (props: any) => {
      const startTime = performance.now();
      
      React.useEffect(() => {
        const renderTime = performance.now() - startTime;
        
        if (renderTime > this.slowThreshold) {
          console.warn(`[Performance] Slow render detected for ${componentName}: ${renderTime.toFixed(2)}ms`);
        }

        this.metrics.push({
          renderTime,
          componentName,
          timestamp: Date.now(),
          props: Object.keys(props)
        });

        // Keep only last 100 metrics
        if (this.metrics.length > 100) {
          this.metrics.shift();
        }
      });

      return React.createElement(Component, props);
    };

    return MeasuredComponent as T;
  }

  /**
   * Get performance report
   */
  getReport() {
    if (this.metrics.length === 0) return null;

    const grouped = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.componentName]) {
        acc[metric.componentName] = [];
      }
      acc[metric.componentName].push(metric.renderTime);
      return acc;
    }, {} as Record<string, number[]>);

    const report = Object.entries(grouped).map(([name, times]) => {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const max = Math.max(...times);
      const min = Math.min(...times);
      
      return {
        component: name,
        renders: times.length,
        avgTime: avg.toFixed(2),
        maxTime: max.toFixed(2),
        minTime: min.toFixed(2),
        slow: times.filter(t => t > this.slowThreshold).length
      };
    });

    return report.sort((a, b) => parseFloat(b.avgTime) - parseFloat(a.avgTime));
  }

  /**
   * Clear metrics
   */
  clear() {
    this.metrics = [];
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Request idle callback polyfill
 */
export const requestIdleCallback = 
  window.requestIdleCallback ||
  function (cb: IdleRequestCallback) {
    const start = Date.now();
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      });
    }, 1);
  };

/**
 * Cancel idle callback polyfill
 */
export const cancelIdleCallback =
  window.cancelIdleCallback ||
  function (id: number) {
    clearTimeout(id);
  };

/**
 * Defer non-critical work
 */
export function deferWork(callback: () => void): void {
  requestIdleCallback(() => {
    callback();
  }, { timeout: 2000 });
}

/**
 * Memoize expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Limit cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  }) as T;
}