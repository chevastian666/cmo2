/**
 * Store Optimizer - Prevents unnecessary updates and re-renders
 * Uses shallow comparison and update batching
 */

import { StoreApi } from 'zustand';

interface OptimizationConfig {
  enableDeepComparison?: boolean;
  batchUpdates?: boolean;
  batchInterval?: number;
  debugMode?: boolean;
}

export class StoreOptimizer<T extends object> {
  private pendingUpdates = new Map<keyof T, any>();
  private updateTimer: NodeJS.Timeout | null = null;
  private config: OptimizationConfig;
  private store: StoreApi<T>;
  private updateCount = 0;
  private skipCount = 0;

  constructor(store: StoreApi<T>, config: OptimizationConfig = {}) {
    this.store = store;
    this.config = {
      enableDeepComparison: false,
      batchUpdates: true,
      batchInterval: 16, // One frame (60fps)
      debugMode: false,
      ...config
    };
  }

  /**
   * Optimized update that checks if update is necessary
   */
  update<K extends keyof T>(key: K, value: T[K]): void {
    const currentState = this.store.getState();
    const currentValue = currentState[key];

    // Skip if value hasn't changed
    if (this.areEqual(currentValue, value)) {
      this.skipCount++;
      if (this.config.debugMode) {
        console.log(`[StoreOptimizer] Skipped update for ${String(key)}: value unchanged`);
      }
      return;
    }

    // Batch updates if enabled
    if (this.config.batchUpdates) {
      this.batchUpdate(key, value);
    } else {
      this.immediateUpdate(key, value);
    }
  }

  /**
   * Update multiple fields at once (more efficient)
   */
  updateMultiple(updates: Partial<T>): void {
    const currentState = this.store.getState();
    const actualUpdates: Partial<T> = {};
    let hasChanges = false;

    // Filter out unchanged values
    for (const [key, value] of Object.entries(updates) as [keyof T, T[keyof T]][]) {
      if (!this.areEqual(currentState[key], value)) {
        actualUpdates[key] = value;
        hasChanges = true;
      } else {
        this.skipCount++;
      }
    }

    // Only update if there are actual changes
    if (hasChanges) {
      if (this.config.batchUpdates) {
        for (const [key, value] of Object.entries(actualUpdates) as [keyof T, T[keyof T]][]) {
          this.pendingUpdates.set(key, value);
        }
        this.scheduleBatchUpdate();
      } else {
        this.store.setState(actualUpdates as T);
        this.updateCount++;
      }
    }
  }

  /**
   * Compare values for equality
   */
  private areEqual(a: any, b: any): boolean {
    // Same reference
    if (a === b) return true;

    // Different types
    if (typeof a !== typeof b) return false;
    if (a === null || b === null) return a === b;
    if (a === undefined || b === undefined) return a === b;

    // Primitives
    if (typeof a !== 'object') return a === b;

    // Arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      
      if (this.config.enableDeepComparison) {
        return a.every((item, index) => this.areEqual(item, b[index]));
      } else {
        // Shallow comparison for arrays
        return a.every((item, index) => item === b[index]);
      }
    }

    // Objects
    if (!Array.isArray(a) && !Array.isArray(b)) {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      
      if (keysA.length !== keysB.length) return false;
      
      if (this.config.enableDeepComparison) {
        return keysA.every(key => this.areEqual(a[key], b[key]));
      } else {
        // Shallow comparison for objects
        return keysA.every(key => a[key] === b[key]);
      }
    }

    return false;
  }

  /**
   * Batch update implementation
   */
  private batchUpdate<K extends keyof T>(key: K, value: T[K]): void {
    this.pendingUpdates.set(key, value);
    this.scheduleBatchUpdate();
  }

  /**
   * Schedule batch update execution
   */
  private scheduleBatchUpdate(): void {
    if (this.updateTimer) return;

    this.updateTimer = setTimeout(() => {
      this.executeBatchUpdate();
    }, this.config.batchInterval);
  }

  /**
   * Execute all pending updates
   */
  private executeBatchUpdate(): void {
    if (this.pendingUpdates.size === 0) return;

    const updates: Partial<T> = {};
    for (const [key, value] of this.pendingUpdates.entries()) {
      updates[key] = value;
    }

    this.store.setState(updates as T);
    this.updateCount++;

    if (this.config.debugMode) {
      console.log(`[StoreOptimizer] Batch update executed:`, {
        fields: Array.from(this.pendingUpdates.keys()),
        updateCount: this.updateCount
      });
    }

    this.pendingUpdates.clear();
    this.updateTimer = null;
  }

  /**
   * Immediate update without batching
   */
  private immediateUpdate<K extends keyof T>(key: K, value: T[K]): void {
    this.store.setState({ [key]: value } as T);
    this.updateCount++;
  }

  /**
   * Force flush all pending updates
   */
  flush(): void {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
      this.updateTimer = null;
    }
    this.executeBatchUpdate();
  }

  /**
   * Get optimization statistics
   */
  getStats() {
    return {
      updateCount: this.updateCount,
      skipCount: this.skipCount,
      pendingUpdates: this.pendingUpdates.size,
      efficiency: this.skipCount / (this.updateCount + this.skipCount) || 0
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.updateCount = 0;
    this.skipCount = 0;
  }
}

// Factory function to create optimized store updater
export function createOptimizedUpdater<T extends object>(
  store: StoreApi<T>,
  config?: OptimizationConfig
): StoreOptimizer<T> {
  return new StoreOptimizer(store, config);
}