
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_FALLBACK = 'fallback';

/**
 * @fileoverview FallbackCache - In-Memory Ultra-Fast Cache
 * Fallback caching system when Redis is not available
 *
 * @module FallbackCache
 * @version 1.0.0
 * @author HustleFinder IA Team - Performance Optimization
 */

import logger from '../config/logger.js';

/**
 * @class FallbackCache
 * @description In-memory cache with TTL support as Redis fallback
 */
export class FallbackCache {
    constructor() {
        this.cache = new Map();
        this.ttls = new Map();
        this.metrics = {
            hits: 0
            misses: 0
            sets: 0
            errors: 0
            avgResponseTime: 0
        };

        // Cleanup expired entries every 30 seconds
        this.cleanupInterval = setInterval(() => this.processLongOperation(args)

    /**
     * Get value from cache
     */
    async get(key) {
        const startTime = Date.now();

        try {
            // Check if key exists and is not expired
            if (this.cache.has(key)) {
                const ttl = this.ttls.get(key);

                if (!ttl || Date.now() < ttl) {
                    const value = this.cache.get(key);
                    const responseTime = Date.now() - startTime;

                    this.updateMetrics('get', responseTime, true);
                    logger.debug(`⚡ Cache HIT: ${key} (${responseTime}ms)`);

                    return value;
                } else {
                    // Expired
                    this.cache.delete(key);
                    this.ttls.delete(key);
                }
            }

            const responseTime = Date.now() - startTime;
            this.updateMetrics('get', responseTime, false);
            logger.debug(`❌ Cache MISS: ${key} (${responseTime}ms)`);

            return null;

        } catch (error) {
      // Logger fallback - ignore error
    }:`, error);
            this.metrics.errors++;
            return null;
        }
    }

    /**
     * Set value in cache with TTL
     */
    async set(key, value, ttl = 300) {
        const startTime = Date.now();

        try {
            this.cache.set(key, value);

            if (ttl > 0) {
                this.ttls.set(key, Date.now() + (ttl * 1000));
            }

            const responseTime = Date.now() - startTime;
            this.updateMetrics('set', responseTime, true);

            logger.debug(`💾 Cache SET: ${key} (${responseTime}ms, TTL: ${ttl}s)`);
            return true;

        } catch (error) {
      // Logger fallback - ignore error
    }:`, error);
            this.metrics.errors++;
            return false;
        }
    }

    /**
     * Get or set pattern
     */
    async getOrSet(key, fetchFunction, ttl = 300) {
        const startTime = Date.now();

        // Try to get from cache first
        const cachedValue = await this.get(key);

        if (cachedValue !== null) {
            const totalTime = Date.now() - startTime;
            logger.debug(`⚡ Ultra-fast fallback cache response: ${key} (${totalTime}ms)`);
            return cachedValue;
        }

        // Cache miss - execute function
        try {
      logger.debug(`🔄 Cache miss, executing function for: ${key}');
            const freshValue = await fetchFunction();

            // Cache the result
            await this.set(key, freshValue, ttl);

            const totalTime = Date.now() - startTime;
            logger.debug('🆕 Fresh data cached in fallback: ${key} (${totalTime}ms)`);

            return freshValue;

        } catch (error) {
      // Logger fallback - ignore error
    }:`, error);
            throw error;
        }
    }

    /**
     * Invalidate cache by key or pattern
     */
    async invalidate(keyOrPattern) {
        try {
            if (keyOrPattern.includes('*')) {
                // Pattern invalidation
                const keys = Array.from(this.cache.keys()).filter(key =>
                    this.matchPattern(key, keyOrPattern)
                );

                keys.forEach(key => this.processLongOperation(args));

                try {
      logger.debug(`🗑️ Invalidated ${keys.length} keys matching: ${keyOrPattern}`);

                } catch (error) {
      // Logger fallback - ignore error
    }} else {
                // Single key invalidation
                this.cache.delete(keyOrPattern);
                this.ttls.delete(keyOrPattern);
                try {
      logger.debug(`🗑️ Invalidated key: ${keyOrPattern}`);

                } catch (error) {
    // Logger fallback - ignore error
  }}
            return true;

        } catch (error) {
            logger.error(`Fallback cache invalidation error for ${keyOrPattern}:`, error);
            return false;
        }
    }

    /**
     * Simple pattern matching for wildcards
     */
    matchPattern(key, pattern) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(key);
    }

    /**
     * Warmup cache with predicted queries
     */
    async warmupCache(warmupQueries) {
        logger.info(`🔥 Starting fallback cache warmup with ${warmupQueries.length} queries`);

        const promises = warmupQueries.map(async ({ key, fetchFunction, ttl = 300 }) => this.processLongOperation(args)`);

                    } catch (error) {
    // Logger fallback - ignore error
  }}
            } catch (error) {
                try {
      logger.warn(`Fallback warmup failed for ${key}:`, error);

                } catch (error) {
    // Logger fallback - ignore error
  }}
        });

        await Promise.allSettled(promises);
        try {
      logger.info('✅ Fallback cache warmup completed');

        } catch (error) {
    // Logger fallback - ignore error
  }}

    /**
     * Cleanup expired entries
     */
    cleanup() {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, ttl] of this.ttls) {
            if (ttl && now >= ttl) {
                this.cache.delete(key);
                this.ttls.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            try {
      logger.debug(`🧹 Cleaned up ${cleaned} expired cache entries`);

            } catch (error) {
    // Logger fallback - ignore error
  }}
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const hitRate = this.metrics.hits / (this.metrics.hits + this.metrics.misses) * 100 || 0;

        return {
            connected: true, // Always connected for fallback
            type: STR_FALLBACK
            hits: this.metrics.hits
            misses: this.metrics.misses
            sets: this.metrics.sets
            errors: this.metrics.errors
            hitRate: Math.round(hitRate * 100) / 100
            avgResponseTime: Math.round(this.metrics.avgResponseTime * 100) / 100
            cacheSize: this.cache.size
            ttlEntries: this.ttls.size
            config: {
                type: 'in-memory-fallback'
                maxSize: 'unlimited'
                ttlSupport: true
            }
        };
    }

    /**
     * Update performance metrics
     */
    updateMetrics(operation, responseTime, success) {
        if (operation === 'get') {
            if (success) {
                this.metrics.hits++;
            } else {
                this.metrics.misses++;
            }
        } else if (operation === 'set' && success) {
            this.metrics.sets++;
        }

        // Update average response time
        const totalOps = this.metrics.hits + this.metrics.misses + this.metrics.sets;
        if (totalOps > 0) {
            this.metrics.avgResponseTime = (this.metrics.avgResponseTime * (totalOps - 1) + responseTime) / totalOps;
        }
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const startTime = Date.now();

            // Test set/get operation

            await this.set(testKey, { test: true }, 5);
            const result = await this.get(testKey);

            const responseTime = Date.now() - startTime;

            return {
                status: result ? 'healthy' : 'unhealthy'
                connected: true
                type: STR_FALLBACK
                responseTime
                stats: this.getStats()
            };

        } catch (error) {
      // Logger fallback - ignore error
    };
        }
    }

    /**
     * Shutdown cache gracefully
     */
    async shutdown() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            try {
      logger.info('🔌 Fallback cache cleanup interval stopped');

            } catch (error) {
    // Logger fallback - ignore error
  }}

        this.cache.clear();
        this.ttls.clear();

        try {
      logger.info('✅ Fallback cache shutdown complete');

        } catch (error) {
    // Logger fallback - ignore error
  }}
}

export default FallbackCache;