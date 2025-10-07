/**
 * Simple in-memory cache for API responses
 * Helps prevent duplicate API calls and improves performance
 */
class ApiCache {
    constructor() {
        this.cache = new Map();
        this.timeouts = new Map();
    }

    /**
     * Generate a cache key from the API endpoint and parameters
     */
    generateKey(endpoint, params = {}) {
        const paramString = JSON.stringify(params);
        return `${endpoint}:${paramString}`;
    }

    /**
     * Set a cache entry with optional TTL (Time To Live)
     */
    set(key, value, ttlMs = 5 * 60 * 1000) { // Default 5 minutes
        // Clear existing timeout if any
        if (this.timeouts.has(key)) {
            clearTimeout(this.timeouts.get(key));
        }

        // Set the cache entry
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });

        // Set expiration timeout
        const timeoutId = setTimeout(() => {
            this.delete(key);
        }, ttlMs);

        this.timeouts.set(key, timeoutId);
    }

    /**
     * Get a cache entry
     */
    get(key) {
        const entry = this.cache.get(key);
        return entry ? entry.value : null;
    }

    /**
     * Check if a cache entry exists and is valid
     */
    has(key) {
        return this.cache.has(key);
    }

    /**
     * Delete a cache entry
     */
    delete(key) {
        if (this.timeouts.has(key)) {
            clearTimeout(this.timeouts.get(key));
            this.timeouts.delete(key);
        }
        return this.cache.delete(key);
    }

    /**
     * Clear all cache entries
     */
    clear() {
        // Clear all timeouts
        for (const timeoutId of this.timeouts.values()) {
            clearTimeout(timeoutId);
        }
        this.timeouts.clear();
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Create a singleton instance
const apiCache = new ApiCache();

export default apiCache;