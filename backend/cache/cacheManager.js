/**
 * Cache Manager for Railway deployment
 * Simple implementation for production stability
 */

import RedisCache from './RedisCache.js';

// Singleton cache instance
let cacheInstance = null;

/**
 * Get or create the Redis cache instance
 */
export function getRedisCache() {
    if (!cacheInstance) {
        cacheInstance = new RedisCache();
    }
    return cacheInstance;
}

/**
 * Initialize cache system
 */
export async function initializeCache() {
    try {
        const cache = getRedisCache();
        await cache.initializeConnection();
        console.log('Cache system initialized successfully');
        return cache;
    } catch (error) {
        console.warn('Cache initialization warning:', error);
        return getRedisCache(); // Return fallback cache
    }
}

/**
 * Close cache connections
 */
export async function closeCache() {
    if (cacheInstance) {
        await cacheInstance.close();
        cacheInstance = null;
        console.log('Cache connections closed');
    }
}

/**
 * Get cache metrics
 */
export function getCacheMetrics() {
    if (cacheInstance) {
        return cacheInstance.getMetrics();
    }
    return {
        connected: false,
        usingFallback: true,
        hits: 0,
        misses: 0,
        sets: 0,
        errors: 0,
        cacheSize: 0
    };
}

export default {
    getRedisCache,
    initializeCache,
    closeCache,
    getCacheMetrics
};