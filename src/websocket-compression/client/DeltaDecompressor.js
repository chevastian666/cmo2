/**
 * Delta Decompressor for WebSocket Client
 * Reconstructs full state from delta updates
 */

export class DeltaDecompressor {
  constructor() {
    this.stateCache = new Map(); // precintoId -> current state
    this.lastUpdate = new Map(); // precintoId -> timestamp
    this.metrics = {
      deltasApplied: 0,
      fullStatesReceived: 0,
      resyncRequests: 0,
      stateSize: 0
    };
  }

  /**
   * Set full state for a precinto
   */
  setFullState(precintoId, state) {
    this.stateCache.set(precintoId, { ...state });
    this.lastUpdate.set(precintoId, Date.now());
    this.metrics.fullStatesReceived++;
    this.updateMetrics();
    
    return state;
  }

  /**
   * Apply delta update to existing state
   */
  applyDelta(precintoId, deltas) {
    const currentState = this.stateCache.get(precintoId);
    
    if (!currentState) {
      console.warn(`No base state for precinto ${precintoId}, need full sync`);
      this.metrics.resyncRequests++;
      return null;
    }
    
    // Apply deltas to create new state
    const newState = { ...currentState };
    
    for (const [field, value] of Object.entries(deltas)) {
      newState[field] = value;
    }
    
    // Update cache
    this.stateCache.set(precintoId, newState);
    this.lastUpdate.set(precintoId, Date.now());
    this.metrics.deltasApplied++;
    this.updateMetrics();
    
    return newState;
  }

  /**
   * Get current state for a precinto
   */
  getState(precintoId) {
    return this.stateCache.get(precintoId);
  }

  /**
   * Get all states
   */
  getAllStates() {
    const states = {};
    for (const [id, state] of this.stateCache) {
      states[id] = state;
    }
    return states;
  }

  /**
   * Get states for multiple precintos
   */
  getStates(precintoIds) {
    const states = {};
    for (const id of precintoIds) {
      const state = this.stateCache.get(id);
      if (state) {
        states[id] = state;
      }
    }
    return states;
  }

  /**
   * Clear state for a precinto
   */
  clearState(precintoId) {
    this.stateCache.delete(precintoId);
    this.lastUpdate.delete(precintoId);
    this.updateMetrics();
  }

  /**
   * Clear all states
   */
  clearAll() {
    this.stateCache.clear();
    this.lastUpdate.clear();
    this.metrics.stateSize = 0;
  }

  /**
   * Check if state is stale
   */
  isStateStale(precintoId, maxAge = 300000) { // 5 minutes default
    const lastUpdate = this.lastUpdate.get(precintoId);
    if (!lastUpdate) return true;
    
    return Date.now() - lastUpdate > maxAge;
  }

  /**
   * Get stale states that need resync
   */
  getStaleStates(maxAge = 300000) {
    const staleIds = [];
    const now = Date.now();
    
    for (const [id, timestamp] of this.lastUpdate) {
      if (now - timestamp > maxAge) {
        staleIds.push(id);
      }
    }
    
    return staleIds;
  }

  /**
   * Update metrics
   */
  updateMetrics() {
    // Estimate memory usage (rough approximation)
    this.metrics.stateSize = this.stateCache.size * 200; // ~200 bytes per state
  }

  /**
   * Get metrics
   */
  getMetrics() {
    const compressionRatio = this.metrics.deltasApplied > 0
      ? this.metrics.deltasApplied / (this.metrics.deltasApplied + this.metrics.fullStatesReceived)
      : 0;
    
    return {
      ...this.metrics,
      compressionRatio: (compressionRatio * 100).toFixed(2) + '%',
      cachedStates: this.stateCache.size,
      memoryUsage: this.formatBytes(this.metrics.stateSize)
    };
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  }

  /**
   * Export states for debugging
   */
  exportStates() {
    return {
      states: Object.fromEntries(this.stateCache),
      lastUpdates: Object.fromEntries(this.lastUpdate),
      metrics: this.getMetrics()
    };
  }

  /**
   * Import states (for testing/recovery)
   */
  importStates(data) {
    if (data.states) {
      this.stateCache = new Map(Object.entries(data.states));
    }
    if (data.lastUpdates) {
      this.lastUpdate = new Map(Object.entries(data.lastUpdates));
    }
    this.updateMetrics();
  }
}