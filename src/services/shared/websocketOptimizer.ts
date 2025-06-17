/**
 * WebSocket Optimizer - Batches and throttles WebSocket updates
 * Prevents excessive re-renders and improves performance
 */

interface BatchConfig {
  maxBatchSize: number;
  batchInterval: number;
  throttleEvents?: string[];
  throttleInterval?: number;
}

interface BatchedUpdate {
  type: string;
  updates: any[];
  timestamp: number;
}

export class WebSocketOptimizer {
  private batches = new Map<string, any[]>();
  private batchTimers = new Map<string, NodeJS.Timeout>();
  private throttleTimers = new Map<string, NodeJS.Timeout>();
  private lastEmitTime = new Map<string, number>();
  private config: BatchConfig;
  private onBatchReady: (batch: BatchedUpdate) => void;

  constructor(
    onBatchReady: (batch: BatchedUpdate) => void,
    config: BatchConfig = {
      maxBatchSize: 50,
      batchInterval: 100, // 100ms batching window
      throttleEvents: ['location_update', 'battery_update'],
      throttleInterval: 1000 // 1 second throttle for specific events
    }
  ) {
    this.onBatchReady = onBatchReady;
    this.config = config;
  }

  /**
   * Add an update to the batch queue
   */
  addUpdate(type: string, data: any): void {
    // Check if this event type should be throttled
    if (this.shouldThrottle(type)) {
      this.addThrottledUpdate(type, data);
      return;
    }

    // Add to batch
    if (!this.batches.has(type)) {
      this.batches.set(type, []);
    }

    const batch = this.batches.get(type)!;
    batch.push(data);

    // If batch is full, emit immediately
    if (batch.length >= this.config.maxBatchSize) {
      this.emitBatch(type);
      return;
    }

    // Otherwise, set up delayed emit if not already scheduled
    if (!this.batchTimers.has(type)) {
      const timer = setTimeout(() => {
        this.emitBatch(type);
      }, this.config.batchInterval);

      this.batchTimers.set(type, timer);
    }
  }

  /**
   * Check if an event type should be throttled
   */
  private shouldThrottle(type: string): boolean {
    return this.config.throttleEvents?.includes(type) || false;
  }

  /**
   * Handle throttled updates
   */
  private addThrottledUpdate(type: string, data: any): void {
    const now = Date.now();
    const lastEmit = this.lastEmitTime.get(type) || 0;

    // If enough time has passed, emit immediately
    if (now - lastEmit >= (this.config.throttleInterval || 1000)) {
      this.onBatchReady({
        type,
        updates: [data],
        timestamp: now
      });
      this.lastEmitTime.set(type, now);
      return;
    }

    // Otherwise, schedule for next available slot
    if (!this.throttleTimers.has(type)) {
      const delay = (this.config.throttleInterval || 1000) - (now - lastEmit);
      const timer = setTimeout(() => {
        this.throttleTimers.delete(type);
        this.addThrottledUpdate(type, data);
      }, delay);

      this.throttleTimers.set(type, timer);
    }
  }

  /**
   * Emit a batch of updates
   */
  private emitBatch(type: string): void {
    const batch = this.batches.get(type);
    if (!batch || batch.length === 0) return;

    // Clear batch
    this.batches.delete(type);
    
    // Clear timer
    const timer = this.batchTimers.get(type);
    if (timer) {
      clearTimeout(timer);
      this.batchTimers.delete(type);
    }

    // Emit batch
    this.onBatchReady({
      type,
      updates: batch,
      timestamp: Date.now()
    });
  }

  /**
   * Force emit all pending batches
   */
  flush(): void {
    for (const type of this.batches.keys()) {
      this.emitBatch(type);
    }
  }

  /**
   * Clear all pending updates and timers
   */
  clear(): void {
    // Clear all timers
    for (const timer of this.batchTimers.values()) {
      clearTimeout(timer);
    }
    for (const timer of this.throttleTimers.values()) {
      clearTimeout(timer);
    }

    // Clear all data
    this.batches.clear();
    this.batchTimers.clear();
    this.throttleTimers.clear();
    this.lastEmitTime.clear();
  }

  /**
   * Get statistics about current batches
   */
  getStats(): {
    pendingBatches: number;
    totalPendingUpdates: number;
    batchTypes: string[];
  } {
    let totalUpdates = 0;
    const batchTypes: string[] = [];

    for (const [type, batch] of this.batches.entries()) {
      totalUpdates += batch.length;
      batchTypes.push(`${type}(${batch.length})`);
    }

    return {
      pendingBatches: this.batches.size,
      totalPendingUpdates: totalUpdates,
      batchTypes
    };
  }
}

// Singleton instance
let optimizerInstance: WebSocketOptimizer | null = null;

export function getWebSocketOptimizer(
  onBatchReady: (batch: BatchedUpdate) => void,
  config?: BatchConfig
): WebSocketOptimizer {
  if (!optimizerInstance) {
    optimizerInstance = new WebSocketOptimizer(onBatchReady, config);
  }
  return optimizerInstance;
}