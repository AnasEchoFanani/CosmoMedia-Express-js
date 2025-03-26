class CacheManager {
  constructor(duration = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.duration = duration;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.duration) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    this.cache.delete(key);
  }
}

export const createCache = (duration) => new CacheManager(duration);
