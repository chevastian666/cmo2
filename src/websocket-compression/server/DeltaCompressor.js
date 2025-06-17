/**
 * Delta Compression System
 * Calculates and manages state differences for efficient transmission
 */

import { buildDeltaMessage, buildFullStateMessage, buildBatchDeltaMessage } from '../protocol/MessageTypes.js';

export class DeltaCompressor {
  constructor(options = {}) {
    this.stateCache = new Map(); // precintoId -> last known state
    this.deltaBuffer = new Map(); // precintoId -> pending deltas
    this.metrics = {
      totalBytes: 0,
      compressedBytes: 0,
      deltaCount: 0,
      fullStateCount: 0,
      compressionRatio: 0
    };
    
    // Configuration
    this.options = {
      fullStateSyncInterval: 300000, // 5 minutes
      batchSize: 50, // Max deltas per batch
      batchInterval: 100, // ms to wait before sending batch
      significantChangeThreshold: {
        latitude: 0.00001, // ~1 meter
        longitude: 0.00001,
        temperature: 0.5,
        battery: 1,
        speed: 0.1
      },
      ...options
    };
    
    this.lastFullStateSync = new Map(); // precintoId -> timestamp
    this.batchTimer = null;
  }

  /**
   * Process new state and return delta or full state message
   */
  processState(precintoId, newState) {
    const currentTime = Date.now();
    const lastState = this.stateCache.get(precintoId);
    const lastSync = this.lastFullStateSync.get(precintoId) || 0;
    
    // Check if we need to send full state
    if (!lastState || (currentTime - lastSync) > this.options.fullStateSyncInterval) {
      return this.createFullState(precintoId, newState);
    }
    
    // Calculate deltas
    const deltas = this.calculateDeltas(lastState, newState);
    
    // If no significant changes, return null
    if (Object.keys(deltas).length === 0) {
      return null;
    }
    
    // Update cache with new state
    this.updateStateCache(precintoId, newState, deltas);
    
    // Add to batch buffer
    this.addToBatch(precintoId, deltas);
    
    // Return individual delta if batch is disabled
    if (this.options.batchSize === 1) {
      return this.createDelta(precintoId, deltas);
    }
    
    return null; // Will be sent as part of batch
  }

  /**
   * Calculate differences between states
   */
  calculateDeltas(oldState, newState) {
    const deltas = {};
    const threshold = this.options.significantChangeThreshold;
    
    // Check each field for changes
    if (Math.abs(newState.latitude - oldState.latitude) > threshold.latitude) {
      deltas.latitude = newState.latitude;
    }
    
    if (Math.abs(newState.longitude - oldState.longitude) > threshold.longitude) {
      deltas.longitude = newState.longitude;
    }
    
    if (newState.status !== oldState.status) {
      deltas.status = newState.status;
    }
    
    if (Math.abs(newState.temperature - oldState.temperature) > threshold.temperature) {
      deltas.temperature = newState.temperature;
    }
    
    if (Math.abs(newState.battery - oldState.battery) >= threshold.battery) {
      deltas.battery = newState.battery;
    }
    
    // Always include timestamp if anything changed
    if (Object.keys(deltas).length > 0) {
      deltas.timestamp = newState.timestamp;
    }
    
    // Optional fields
    if (newState.signalStrength !== undefined && newState.signalStrength !== oldState.signalStrength) {
      deltas.signalStrength = newState.signalStrength;
    }
    
    if (newState.speed !== undefined && Math.abs((newState.speed || 0) - (oldState.speed || 0)) > threshold.speed) {
      deltas.speed = newState.speed;
    }
    
    if (newState.heading !== undefined && newState.heading !== oldState.heading) {
      deltas.heading = newState.heading;
    }
    
    if (newState.altitude !== undefined && newState.altitude !== oldState.altitude) {
      deltas.altitude = newState.altitude;
    }
    
    return deltas;
  }

  /**
   * Update state cache with partial changes
   */
  updateStateCache(precintoId, newState, deltas) {
    const cachedState = this.stateCache.get(precintoId) || {};
    
    // Apply deltas to cached state
    for (const [field, value] of Object.entries(deltas)) {
      cachedState[field] = value;
    }
    
    // Ensure we have all fields from new state
    this.stateCache.set(precintoId, { ...newState, ...cachedState });
  }

  /**
   * Add delta to batch buffer
   */
  addToBatch(precintoId, deltas) {
    this.deltaBuffer.set(precintoId, deltas);
    
    // Start batch timer if not already running
    if (!this.batchTimer && this.deltaBuffer.size >= this.options.batchSize) {
      this.sendBatch();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.sendBatch(), this.options.batchInterval);
    }
  }

  /**
   * Send batched deltas
   */
  sendBatch() {
    if (this.deltaBuffer.size === 0) {
      this.batchTimer = null;
      return null;
    }
    
    const updates = Array.from(this.deltaBuffer.entries()).map(([precintoId, deltas]) => ({
      precintoId,
      deltas
    }));
    
    this.deltaBuffer.clear();
    this.batchTimer = null;
    
    const batchMessage = buildBatchDeltaMessage(updates);
    this.updateMetrics(batchMessage.length, updates.length * 50); // Estimate uncompressed size
    
    return {
      type: 'batch',
      buffer: batchMessage,
      count: updates.length
    };
  }

  /**
   * Force send any pending batches
   */
  flush() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    return this.sendBatch();
  }

  /**
   * Create full state message
   */
  createFullState(precintoId, state) {
    this.stateCache.set(precintoId, state);
    this.lastFullStateSync.set(precintoId, Date.now());
    
    const buffer = buildFullStateMessage(precintoId, state);
    this.metrics.fullStateCount++;
    this.updateMetrics(buffer.length, buffer.length);
    
    return {
      type: 'full',
      buffer,
      precintoId
    };
  }

  /**
   * Create delta message
   */
  createDelta(precintoId, deltas) {
    const buffer = buildDeltaMessage(precintoId, deltas);
    this.metrics.deltaCount++;
    
    // Estimate uncompressed size (full state would be ~50 bytes)
    this.updateMetrics(buffer.length, 50);
    
    return {
      type: 'delta',
      buffer,
      precintoId,
      fields: Object.keys(deltas).length
    };
  }

  /**
   * Update compression metrics
   */
  updateMetrics(compressedSize, uncompressedSize) {
    this.metrics.compressedBytes += compressedSize;
    this.metrics.totalBytes += uncompressedSize;
    this.metrics.compressionRatio = 1 - (this.metrics.compressedBytes / this.metrics.totalBytes);
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    const avgDeltaSize = this.metrics.deltaCount > 0 
      ? this.metrics.compressedBytes / this.metrics.deltaCount 
      : 0;
    
    return {
      ...this.metrics,
      avgDeltaSize,
      compressionPercentage: (this.metrics.compressionRatio * 100).toFixed(2) + '%',
      bandwidthSaved: this.formatBytes(this.metrics.totalBytes - this.metrics.compressedBytes),
      cacheSize: this.stateCache.size
    };
  }

  /**
   * Clear state for a specific precinto
   */
  clearState(precintoId) {
    this.stateCache.delete(precintoId);
    this.lastFullStateSync.delete(precintoId);
    this.deltaBuffer.delete(precintoId);
  }

  /**
   * Clear all cached states
   */
  clearAll() {
    this.stateCache.clear();
    this.lastFullStateSync.clear();
    this.deltaBuffer.clear();
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
    return (bytes / 1073741824).toFixed(2) + ' GB';
  }

  /**
   * Get memory usage estimate
   */
  getMemoryUsage() {
    // Rough estimate: 200 bytes per cached state
    const stateMemory = this.stateCache.size * 200;
    const bufferMemory = this.deltaBuffer.size * 100;
    
    return {
      states: this.formatBytes(stateMemory),
      buffers: this.formatBytes(bufferMemory),
      total: this.formatBytes(stateMemory + bufferMemory)
    };
  }
}