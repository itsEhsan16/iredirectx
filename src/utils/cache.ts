/**
 * Cache utility for storing and retrieving data with expiration
 */

interface CacheItem<T> {
  value: T;
  expiry: number;
}

class Cache {
  private storage: Storage;
  private prefix: string;

  constructor(storage: Storage = localStorage, prefix: string = 'iredirectx_cache_') {
    this.storage = storage;
    this.prefix = prefix;
  }

  /**
   * Set a value in the cache with an expiration time
   * @param key The cache key
   * @param value The value to store
   * @param ttlSeconds Time to live in seconds
   */
  set<T>(key: string, value: T, ttlSeconds: number = 3600): void {
    const item: CacheItem<T> = {
      value,
      expiry: Date.now() + (ttlSeconds * 1000),
    };

    try {
      this.storage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.error('Cache set error:', error);
      // If storage is full, clear some space
      this.cleanup();
      try {
        this.storage.setItem(this.prefix + key, JSON.stringify(item));
      } catch (e) {
        console.error('Cache set retry error:', e);
      }
    }
  }

  /**
   * Get a value from the cache
   * @param key The cache key
   * @returns The cached value or null if not found or expired
   */
  get<T>(key: string): T | null {
    const itemStr = this.storage.getItem(this.prefix + key);
    
    if (!itemStr) return null;
    
    try {
      const item: CacheItem<T> = JSON.parse(itemStr);
      
      // Check if the item has expired
      if (Date.now() > item.expiry) {
        this.remove(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Remove an item from the cache
   * @param key The cache key
   */
  remove(key: string): void {
    this.storage.removeItem(this.prefix + key);
  }

  /**
   * Clear all cache items with this prefix
   */
  clear(): void {
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key?.startsWith(this.prefix)) {
        this.storage.removeItem(key);
        i--; // Adjust index since we're removing items
      }
    }
  }

  /**
   * Remove expired items from the cache
   */
  cleanup(): void {
    const now = Date.now();
    
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      
      if (key?.startsWith(this.prefix)) {
        try {
          const itemStr = this.storage.getItem(key);
          if (itemStr) {
            const item = JSON.parse(itemStr);
            if (now > item.expiry) {
              this.storage.removeItem(key);
              i--; // Adjust index since we're removing items
            }
          }
        } catch (error) {
          console.error('Cache cleanup error:', error);
        }
      }
    }
  }
}

// Create and export a default instance
const cache = new Cache();

export default cache;