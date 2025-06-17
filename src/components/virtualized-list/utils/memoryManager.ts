/**
 * Memory manager for efficient DOM element recycling
 */

export class VirtualListMemoryManager {
  private itemPool: Map<string, HTMLElement[]> = new Map();
  private maxPoolSize: number;
  private totalElements: number = 0;
  private recycleStats = {
    hits: 0,
    misses: 0,
    created: 0,
    recycled: 0
  };

  constructor(maxPoolSize: number = 100) {
    this.maxPoolSize = maxPoolSize;
  }

  /**
   * Get a recycled element or create a new one
   */
  getElement(type: string = 'default'): HTMLElement | null {
    const pool = this.itemPool.get(type) || [];
    
    if (pool.length > 0) {
      this.recycleStats.hits++;
      const element = pool.pop()!;
      this.itemPool.set(type, pool);
      
      // Clear previous content
      this.resetElement(element);
      return element;
    }

    this.recycleStats.misses++;
    if (this.totalElements < this.maxPoolSize) {
      this.recycleStats.created++;
      this.totalElements++;
      return this.createElement(type);
    }

    return null;
  }

  /**
   * Return an element to the pool for recycling
   */
  recycleElement(element: HTMLElement, type: string = 'default'): void {
    const pool = this.itemPool.get(type) || [];
    
    if (pool.length < this.maxPoolSize) {
      this.recycleStats.recycled++;
      this.resetElement(element);
      pool.push(element);
      this.itemPool.set(type, pool);
    }
  }

  /**
   * Create a new element with optimizations
   */
  private createElement(type: string): HTMLElement {
    const element = document.createElement('div');
    element.className = `virtual-list-item virtual-list-item--${type}`;
    
    // Apply performance optimizations
    element.style.cssText = `
      contain: layout style paint;
      will-change: transform;
      transform: translateZ(0);
    `;
    
    return element;
  }

  /**
   * Reset element to clean state
   */
  private resetElement(element: HTMLElement): void {
    // Remove all event listeners
    const clone = element.cloneNode(false) as HTMLElement;
    element.parentNode?.replaceChild(clone, element);
    
    // Clear inline styles except optimizations
    clone.style.cssText = `
      contain: layout style paint;
      will-change: transform;
      transform: translateZ(0);
    `;
    
    // Clear content
    clone.innerHTML = '';
    clone.className = element.className;
  }

  /**
   * Clean up pools and free memory
   */
  cleanup(): void {
    this.itemPool.forEach((pool) => {
      pool.forEach(element => {
        element.remove();
      });
    });
    this.itemPool.clear();
    this.totalElements = 0;
  }

  /**
   * Get recycling statistics
   */
  getStats() {
    const poolSizes: Record<string, number> = {};
    this.itemPool.forEach((pool, type) => {
      poolSizes[type] = pool.length;
    });

    return {
      ...this.recycleStats,
      totalElements: this.totalElements,
      poolSizes,
      hitRate: this.recycleStats.hits / (this.recycleStats.hits + this.recycleStats.misses)
    };
  }

  /**
   * Optimize pool sizes based on usage patterns
   */
  optimizePools(): void {
    const avgPoolSize = this.totalElements / this.itemPool.size;
    
    this.itemPool.forEach((pool, type) => {
      if (pool.length > avgPoolSize * 2) {
        // Trim oversized pools
        const excess = pool.splice(avgPoolSize);
        excess.forEach(el => el.remove());
        this.totalElements -= excess.length;
      }
    });
  }
}

/**
 * Singleton instance for global usage
 */
let globalMemoryManager: VirtualListMemoryManager | null = null;

export function getGlobalMemoryManager(): VirtualListMemoryManager {
  if (!globalMemoryManager) {
    globalMemoryManager = new VirtualListMemoryManager(200);
  }
  return globalMemoryManager;
}

/**
 * Memory usage monitor
 */
export class MemoryMonitor {
  private measurements: number[] = [];
  private maxMeasurements: number = 100;

  measure(): number {
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      const usage = memory.usedJSHeapSize / memory.totalJSHeapSize;
      
      this.measurements.push(usage);
      if (this.measurements.length > this.maxMeasurements) {
        this.measurements.shift();
      }
      
      return usage;
    }
    return 0;
  }

  getAverageUsage(): number {
    if (this.measurements.length === 0) return 0;
    const sum = this.measurements.reduce((a, b) => a + b, 0);
    return sum / this.measurements.length;
  }

  isMemoryPressure(): boolean {
    return this.getAverageUsage() > 0.9;
  }

  reset(): void {
    this.measurements = [];
  }
}