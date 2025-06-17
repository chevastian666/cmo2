/**
 * State Manager with Redis Integration
 * Manages precinto states with caching and persistence
 */

import { createClient } from 'redis';
import { EventEmitter } from 'events';

export class StateManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      redis: {
        host: 'localhost',
        port: 6379,
        password: null,
        db: 0,
        keyPrefix: 'precinto:state:'
      },
      cache: {
        enabled: true,
        maxSize: 10000,
        ttl: 300000 // 5 minutes
      },
      persistence: {
        enabled: true,
        writeThrough: true,
        batchWrites: true,
        batchInterval: 1000
      },
      ...options
    };
    
    // In-memory cache
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    
    // Redis client
    this.redis = null;
    this.redisConnected = false;
    
    // Write batch
    this.writeBatch = new Map();
    this.batchTimer = null;
    
    // Statistics
    this.stats = {
      hits: 0,
      misses: 0,
      writes: 0,
      errors: 0
    };
    
    if (this.options.redis && this.options.persistence.enabled) {
      this.initRedis();
    }
  }

  /**
   * Initialize Redis connection
   */
  async initRedis() {
    try {
      this.redis = createClient({
        socket: {
          host: this.options.redis.host,
          port: this.options.redis.port
        },
        password: this.options.redis.password,
        database: this.options.redis.db
      });
      
      this.redis.on('error', (err) => {
        console.error('Redis error:', err);
        this.redisConnected = false;
        this.stats.errors++;
      });
      
      this.redis.on('connect', () => {
        console.log('Connected to Redis');
        this.redisConnected = true;
      });
      
      await this.redis.connect();
      
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      console.log('Running in memory-only mode');
      this.redis = null;
      this.redisConnected = false;
    }
  }

  /**
   * Get state for a precinto
   */
  async getState(precintoId) {
    // Check cache first
    if (this.options.cache.enabled) {
      const cached = this.getFromCache(precintoId);
      if (cached) {
        this.stats.hits++;
        return cached;
      }
    }
    
    this.stats.misses++;
    
    // Try Redis
    if (this.redisConnected) {
      try {
        const key = this.options.redis.keyPrefix + precintoId;
        const data = await this.redis.get(key);
        
        if (data) {
          const state = JSON.parse(data);
          this.setCache(precintoId, state);
          return state;
        }
      } catch (error) {
        console.error('Redis get error:', error);
        this.stats.errors++;
      }
    }
    
    return null;
  }

  /**
   * Set state for a precinto
   */
  async setState(precintoId, state) {
    // Update cache
    if (this.options.cache.enabled) {
      this.setCache(precintoId, state);
    }
    
    // Update stats
    this.stats.writes++;
    
    // Persist to Redis
    if (this.redisConnected && this.options.persistence.enabled) {
      if (this.options.persistence.batchWrites) {
        this.addToBatch(precintoId, state);
      } else {
        await this.persistState(precintoId, state);
      }
    }
    
    // Emit update event
    this.emit('stateUpdate', precintoId, state);
  }

  /**
   * Get multiple states
   */
  async getStates(precintoIds) {
    const states = {};
    const missingIds = [];
    
    // Check cache for all IDs
    for (const id of precintoIds) {
      const cached = this.getFromCache(id);
      if (cached) {
        states[id] = cached;
        this.stats.hits++;
      } else {
        missingIds.push(id);
        this.stats.misses++;
      }
    }
    
    // Fetch missing from Redis
    if (missingIds.length > 0 && this.redisConnected) {
      try {
        const keys = missingIds.map(id => this.options.redis.keyPrefix + id);
        const values = await this.redis.mGet(keys);
        
        values.forEach((value, index) => {
          if (value) {
            const state = JSON.parse(value);
            const id = missingIds[index];
            states[id] = state;
            this.setCache(id, state);
          }
        });
      } catch (error) {
        console.error('Redis mget error:', error);
        this.stats.errors++;
      }
    }
    
    return states;
  }

  /**
   * Delete state
   */
  async deleteState(precintoId) {
    // Remove from cache
    this.cache.delete(precintoId);
    this.cacheTimestamps.delete(precintoId);
    
    // Remove from Redis
    if (this.redisConnected) {
      try {
        const key = this.options.redis.keyPrefix + precintoId;
        await this.redis.del(key);
      } catch (error) {
        console.error('Redis delete error:', error);
        this.stats.errors++;
      }
    }
  }

  /**
   * Get from cache
   */
  getFromCache(precintoId) {
    if (!this.cache.has(precintoId)) {
      return null;
    }
    
    const timestamp = this.cacheTimestamps.get(precintoId);
    const now = Date.now();
    
    // Check TTL
    if (now - timestamp > this.options.cache.ttl) {
      this.cache.delete(precintoId);
      this.cacheTimestamps.delete(precintoId);
      return null;
    }
    
    return this.cache.get(precintoId);
  }

  /**
   * Set cache entry
   */
  setCache(precintoId, state) {
    // Enforce cache size limit
    if (this.cache.size >= this.options.cache.maxSize) {
      // Remove oldest entry
      const oldestId = this.findOldestCacheEntry();
      if (oldestId) {
        this.cache.delete(oldestId);
        this.cacheTimestamps.delete(oldestId);
      }
    }
    
    this.cache.set(precintoId, state);
    this.cacheTimestamps.set(precintoId, Date.now());
  }

  /**
   * Find oldest cache entry
   */
  findOldestCacheEntry() {
    let oldestId = null;
    let oldestTime = Infinity;
    
    for (const [id, timestamp] of this.cacheTimestamps) {
      if (timestamp < oldestTime) {
        oldestTime = timestamp;
        oldestId = id;
      }
    }
    
    return oldestId;
  }

  /**
   * Add to write batch
   */
  addToBatch(precintoId, state) {
    this.writeBatch.set(precintoId, state);
    
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.flushBatch();
      }, this.options.persistence.batchInterval);
    }
  }

  /**
   * Flush write batch
   */
  async flushBatch() {
    if (this.writeBatch.size === 0) {
      this.batchTimer = null;
      return;
    }
    
    const batch = Array.from(this.writeBatch.entries());
    this.writeBatch.clear();
    this.batchTimer = null;
    
    if (!this.redisConnected) return;
    
    try {
      const pipeline = this.redis.pipeline();
      
      for (const [precintoId, state] of batch) {
        const key = this.options.redis.keyPrefix + precintoId;
        pipeline.set(key, JSON.stringify(state), 'EX', 86400); // 24 hour TTL
      }
      
      await pipeline.exec();
      
    } catch (error) {
      console.error('Redis batch write error:', error);
      this.stats.errors++;
    }
  }

  /**
   * Persist single state
   */
  async persistState(precintoId, state) {
    if (!this.redisConnected) return;
    
    try {
      const key = this.options.redis.keyPrefix + precintoId;
      await this.redis.set(key, JSON.stringify(state), 'EX', 86400); // 24 hour TTL
    } catch (error) {
      console.error('Redis write error:', error);
      this.stats.errors++;
    }
  }

  /**
   * Get all states matching pattern
   */
  async getAllStates(pattern = '*') {
    const states = {};
    
    if (!this.redisConnected) {
      // Return from cache only
      for (const [id, state] of this.cache) {
        if (pattern === '*' || id.includes(pattern)) {
          states[id] = state;
        }
      }
      return states;
    }
    
    try {
      const keys = await this.redis.keys(this.options.redis.keyPrefix + pattern);
      
      if (keys.length > 0) {
        const values = await this.redis.mGet(keys);
        
        keys.forEach((key, index) => {
          if (values[index]) {
            const id = key.replace(this.options.redis.keyPrefix, '');
            states[id] = JSON.parse(values[index]);
          }
        });
      }
    } catch (error) {
      console.error('Redis scan error:', error);
      this.stats.errors++;
    }
    
    return states;
  }

  /**
   * Clear all states
   */
  async clearAll() {
    // Clear cache
    this.cache.clear();
    this.cacheTimestamps.clear();
    
    // Clear Redis
    if (this.redisConnected) {
      try {
        const keys = await this.redis.keys(this.options.redis.keyPrefix + '*');
        if (keys.length > 0) {
          await this.redis.del(keys);
        }
      } catch (error) {
        console.error('Redis clear error:', error);
        this.stats.errors++;
      }
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;
    
    return {
      ...this.stats,
      hitRate: hitRate + '%',
      cacheSize: this.cache.size,
      redisConnected: this.redisConnected
    };
  }

  /**
   * Close connections
   */
  async close() {
    // Flush any pending writes
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      await this.flushBatch();
    }
    
    // Close Redis connection
    if (this.redis) {
      await this.redis.quit();
    }
  }
}