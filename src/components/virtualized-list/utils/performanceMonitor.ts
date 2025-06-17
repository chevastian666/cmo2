/**
 * Performance monitoring for virtual list
 */

export interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  scrollLatency: number;
  memoryUsage: number;
  itemsRendered: number;
  cacheHitRate: number;
  recycleRate: number;
}

export class PerformanceMonitor {
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private fpsHistory: number[] = [];
  private renderTimes: number[] = [];
  private scrollLatencies: number[] = [];
  private maxHistorySize: number = 60;
  private rafId: number | null = null;

  constructor() {
    this.startFPSMonitoring();
  }

  /**
   * Start FPS monitoring
   */
  private startFPSMonitoring(): void {
    const measureFPS = (currentTime: number) => {
      if (this.lastFrameTime) {
        const delta = currentTime - this.lastFrameTime;
        const fps = 1000 / delta;
        
        this.fpsHistory.push(fps);
        if (this.fpsHistory.length > this.maxHistorySize) {
          this.fpsHistory.shift();
        }
      }
      
      this.lastFrameTime = currentTime;
      this.frameCount++;
      
      this.rafId = requestAnimationFrame(measureFPS);
    };
    
    this.rafId = requestAnimationFrame(measureFPS);
  }

  /**
   * Measure render time
   */
  measureRender<T>(fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    this.renderTimes.push(end - start);
    if (this.renderTimes.length > this.maxHistorySize) {
      this.renderTimes.shift();
    }
    
    return result;
  }

  /**
   * Measure scroll latency
   */
  measureScrollLatency(latency: number): void {
    this.scrollLatencies.push(latency);
    if (this.scrollLatencies.length > this.maxHistorySize) {
      this.scrollLatencies.shift();
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(additionalMetrics?: Partial<PerformanceMetrics>): PerformanceMetrics {
    return {
      fps: this.getAverageFPS(),
      renderTime: this.getAverageRenderTime(),
      scrollLatency: this.getAverageScrollLatency(),
      memoryUsage: this.getMemoryUsage(),
      itemsRendered: 0,
      cacheHitRate: 0,
      recycleRate: 0,
      ...additionalMetrics
    };
  }

  /**
   * Get average FPS
   */
  private getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.fpsHistory.length);
  }

  /**
   * Get average render time
   */
  private getAverageRenderTime(): number {
    if (this.renderTimes.length === 0) return 0;
    const sum = this.renderTimes.reduce((a, b) => a + b, 0);
    return sum / this.renderTimes.length;
  }

  /**
   * Get average scroll latency
   */
  private getAverageScrollLatency(): number {
    if (this.scrollLatencies.length === 0) return 0;
    const sum = this.scrollLatencies.reduce((a, b) => a + b, 0);
    return sum / this.scrollLatencies.length;
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1048576; // Convert to MB
    }
    return 0;
  }

  /**
   * Check if performance is degraded
   */
  isPerformanceDegraded(): boolean {
    const metrics = this.getMetrics();
    return (
      metrics.fps < 30 ||
      metrics.renderTime > 50 ||
      metrics.scrollLatency > 100
    );
  }

  /**
   * Get performance report
   */
  getReport(): string {
    const metrics = this.getMetrics();
    return `
Performance Report:
- FPS: ${metrics.fps.toFixed(0)}
- Render Time: ${metrics.renderTime.toFixed(2)}ms
- Scroll Latency: ${metrics.scrollLatency.toFixed(2)}ms
- Memory Usage: ${metrics.memoryUsage.toFixed(2)}MB
- Performance Status: ${this.isPerformanceDegraded() ? 'DEGRADED' : 'NORMAL'}
    `.trim();
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.frameCount = 0;
    this.fpsHistory = [];
    this.renderTimes = [];
    this.scrollLatencies = [];
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.reset();
  }
}

/**
 * Performance optimization helper
 */
export class PerformanceOptimizer {
  private degradedPerformanceCount: number = 0;
  private optimizationApplied: boolean = false;

  /**
   * Suggest optimizations based on metrics
   */
  suggestOptimizations(metrics: PerformanceMetrics): string[] {
    const suggestions: string[] = [];

    if (metrics.fps < 30) {
      suggestions.push('Reduce overscan count to improve FPS');
      suggestions.push('Enable scroll throttling');
      suggestions.push('Reduce animation complexity');
    }

    if (metrics.renderTime > 50) {
      suggestions.push('Implement simpler item renderers');
      suggestions.push('Use React.memo for item components');
      suggestions.push('Reduce item component complexity');
    }

    if (metrics.scrollLatency > 100) {
      suggestions.push('Increase scroll debounce time');
      suggestions.push('Reduce prefetch range');
      suggestions.push('Use passive event listeners');
    }

    if (metrics.memoryUsage > 500) {
      suggestions.push('Reduce cache size');
      suggestions.push('Implement more aggressive recycling');
      suggestions.push('Clear unused data');
    }

    if (metrics.cacheHitRate < 0.7) {
      suggestions.push('Increase cache size');
      suggestions.push('Improve prefetch strategy');
    }

    return suggestions;
  }

  /**
   * Auto-apply optimizations if needed
   */
  autoOptimize(
    metrics: PerformanceMetrics,
    config: any,
    updateConfig: (updates: any) => void
  ): boolean {
    if (metrics.fps < 30) {
      this.degradedPerformanceCount++;
    } else {
      this.degradedPerformanceCount = Math.max(0, this.degradedPerformanceCount - 1);
    }

    // Apply optimizations after consistent degradation
    if (this.degradedPerformanceCount > 5 && !this.optimizationApplied) {
      const optimizedConfig = {
        performance: {
          ...config.performance,
          overscanCount: Math.max(1, Math.floor(config.performance.overscanCount * 0.5)),
          prefetchThreshold: config.performance.prefetchThreshold * 1.5,
          scrollThrottleMs: Math.min(100, config.performance.scrollThrottleMs * 2)
        }
      };

      updateConfig(optimizedConfig);
      this.optimizationApplied = true;
      console.log('Auto-applied performance optimizations', optimizedConfig);
      return true;
    }

    // Restore settings if performance improves
    if (this.degradedPerformanceCount === 0 && this.optimizationApplied) {
      this.optimizationApplied = false;
      // Restore original config
      return true;
    }

    return false;
  }
}

/**
 * Performance debugging utilities
 */
export const performanceDebug = {
  mark(name: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(name);
    }
  },

  measure(name: string, startMark: string, endMark?: string): number {
    if (typeof performance !== 'undefined') {
      const end = endMark || `${startMark}-end`;
      performance.mark(end);
      performance.measure(name, startMark, end);
      
      const entries = performance.getEntriesByName(name, 'measure');
      const duration = entries[entries.length - 1]?.duration || 0;
      
      // Cleanup
      performance.clearMarks(startMark);
      performance.clearMarks(end);
      performance.clearMeasures(name);
      
      return duration;
    }
    return 0;
  },

  profile<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    
    return result;
  }
};