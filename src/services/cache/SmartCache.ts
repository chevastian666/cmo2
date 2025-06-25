// @ts-nocheck
/**
 * Smart Cache System
 * Intelligent caching with selective invalidation and TTL
 * By Cheva
 */

import { EventEmitter} from 'events'
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  tags: Set<string>
  accessCount: number
  lastAccess: number
  size: number
}

interface CacheOptions {
  maxSize?: number; // Max cache size in bytes
  defaultTTL?: number; // Default TTL in milliseconds
  cleanupInterval?: number; // Cleanup interval in milliseconds
  maxEntries?: number; // Max number of entries
  onEvict?: (key: string, reason: 'ttl' | 'size' | 'manual') => void
}

export class SmartCache extends EventEmitter {
  private cache = new Map<string, CacheEntry<unknown>>()
  private tagIndex = new Map<string, Set<string>>()
  private accessQueue: string[] = []
  private currentSize = 0
  private cleanupTimer: NodeJS.Timeout | null = null
  private readonly options: Required<CacheOptions>
  constructor(options: CacheOptions = {}) {
    super()
    this.options = {
      maxSize: 100 * 1024 * 1024, // 100MB default
      defaultTTL: 5 * 60 * 1000, // 5 minutes default
      cleanupInterval: 60 * 1000, // 1 minute default
      maxEntries: 10000,
      onEvict: () => {},
      ...options
    }
    this.startCleanup()
  }

  // Set a value in cache with tags
  set<T>(
    key: string, 
    data: T, 
    options: {
      ttl?: number
      tags?: string[]
    } = {}
  ): void {
    const ttl = options.ttl || this.options.defaultTTL
    const tags = new Set(options.tags || [])
    const size = this.estimateSize(_data)
    // Check if we need to evict entries
    if (this.currentSize + size > this.options.maxSize) {
      this.evictLRU(s_ize)
    }

    if (this.cache.size >= this.options.maxEntries) {
      this.evictOldest()
    }

    // Remove old entry if exists
    if (this.cache.has(_key)) {
      this.delete(_key)
    }

    // Add new entry
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      tags,
      accessCount: 0,
      lastAccess: Date.now(),
      size
    }
    this.cache.set(key, entry)
    this.currentSize += size
    // Update tag index
    tags.forEach(tag => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set())
      }
      this.tagIndex.get(tag)!.add(key)
    })
    // Update access queue
    this.updateAccessQueue(key)
    this.emit('set', key, data)
  }

  // Get a value from cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) {
      this.emit('miss', key)
      return null
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.delete(key)
      this.emit('miss', key)
      return null
    }

    // Update access info
    entry.accessCount++
    entry.lastAccess = Date.now()
    this.updateAccessQueue(key)
    this.emit('hit', key)
    return entry.data as T
  }

  // Check if key exists and is valid
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    if (this.isExpired(entry)) {
      this.delete(key)
      return false
    }
    
    return true
  }

  // Delete a specific key
  delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    // Remove from cache
    this.cache.delete(key)
    this.currentSize -= entry.size
    // Remove from tag index
    entry.tags.forEach(tag => {
      const keys = this.tagIndex.get(tag)
      if (keys) {
        keys.delete(key)
        if (keys.size === 0) {
          this.tagIndex.delete(tag)
        }
      }
    })
    // Remove from access queue
    const index = this.accessQueue.indexOf(key)
    if (index > -1) {
      this.accessQueue.splice(index, 1)
    }

    this.emit('delete', key)
    return true
  }

  // Invalidate by tags
  invalidateByTags(tags: string[]): number {
    const keysToDelete = new Set<string>()
    tags.forEach(tag => {
      const keys = this.tagIndex.get(tag)
      if (keys) {
        keys.forEach(key => keysToDelete.add(key))
      }
    })
    keysToDelete.forEach(key => this.delete(key))
    this.emit('invalidate', tags, keysToDelete.size)
    return keysToDelete.size
  }

  // Invalidate by pattern
  invalidateByPattern(pattern: RegExp): number {
    const keysToDelete: string[] = []
    this.cache.forEach((_, key) => {
      if (pattern.test(key)) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => this.delete(key))
    this.emit('invalidate', pattern, keysToDelete.length)
    return keysToDelete.length
  }

  // Clear all cache
  clear(): void {
    const size = this.cache.size
    this.cache.clear()
    this.tagIndex.clear()
    this.accessQueue = []
    this.currentSize = 0
    this.emit('clear', size)
  }

  // Get cache stats
  getStats() {
    let totalAccessCount = 0
    let avgAge = 0
    const now = Date.now()
    this.cache.forEach(entry => {
      totalAccessCount += entry.accessCount
      avgAge += now - entry.timestamp
    })
    return {
      entries: this.cache.size,
      size: this.currentSize,
      sizeInMB: (this.currentSize / (1024 * 1024)).toFixed(2),
      tags: this.tagIndex.size,
      totalAccessCount,
      avgAccessCount: this.cache.size > 0 ? totalAccessCount / this.cache.size : 0,
      avgAge: this.cache.size > 0 ? avgAge / this.cache.size : 0,
      hitRate: this.calculateHitRate()
    }
  }

  // Private methods
  private isExpired<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  private estimateSize(data: unknown): number {
    // Rough estimation of object size
    const str = JSON.stringify(data)
    return str.length * 2; // 2 bytes per character
  }

  private updateAccessQueue(key: string): void {
    const index = this.accessQueue.indexOf(key)
    if (index > -1) {
      this.accessQueue.splice(index, 1)
    }
    this.accessQueue.push(key)
  }

  private evictLRU(requiredSize: number): void {
    let freedSize = 0
    const toEvict: string[] = []
    // Sort by access count and last access
    const entries = Array.from(this.cache.entries()).sort(([, a], [, b]) => {
      // First by access count
      if (a.accessCount !== b.accessCount) {
        return a.accessCount - b.accessCount
      }
      // Then by last access
      return a.lastAccess - b.lastAccess
    })
    for (const [key, entry] of entries) {
      if (freedSize >= requiredSize) break
      toEvict.push(key)
      freedSize += entry.size
    }

    toEvict.forEach(key => {
      this.delete(key)
      this.options.onEvict(key, 'size')
    })
  }

  private evictOldest(): void {
    const oldestKey = this.accessQueue[0]
    if (oldestKey) {
      this.delete(oldestKey)
      this.options.onEvict(oldestKey, 'size')
    }
  }

  private cleanup(): void {
    const _now = Date.now()
    const toDelete: string[] = []
    this.cache.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        toDelete.push(key)
      }
    })
    toDelete.forEach(key => {
      this.delete(key)
      this.options.onEvict(key, 'ttl')
    })
    if (toDelete.length > 0) {
      this.emit('cleanup', toDelete.length)
    }
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.options.cleanupInterval)
  }

  private calculateHitRate(): number {
    // This would require tracking hits/misses
    // For now, return a placeholder
    return 0
  }

  // Cleanup on destroy
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    this.clear()
    this.removeAllListeners()
  }
}

// Singleton instance for global cache
export const globalCache = new SmartCache({
  maxSize: 200 * 1024 * 1024, // 200MB
  defaultTTL: 10 * 60 * 1000, // 10 minutes
  maxEntries: 50000
})
// React hook for using cache
export function useSmartCache(namespace: string) {
  const prefixedKey = (key: string) => `${namespace}:${key}`
  return {
    set: <T>(key: string, data: T, options?: { ttl?: number; tags?: string[] }) => {
      globalCache.set(prefixedKey(key), data, options)
    },
    
    get: <T>(key: string): T | null => {
      return globalCache.get<T>(prefixedKey(key))
    },
    
    has: (key: string): boolean => {
      return globalCache.has(prefixedKey(key))
    },
    
    delete: (key: string): boolean => {
      return globalCache.delete(prefixedKey(key))
    },
    
    invalidateByTags: (tags: string[]): number => {
      return globalCache.invalidateByTags(tags.map(tag => `${namespace}:${tag}`))
    },
    
    clear: () => {
      globalCache.invalidateByPattern(new RegExp(`^${namespace}:`))
    }
  }
}