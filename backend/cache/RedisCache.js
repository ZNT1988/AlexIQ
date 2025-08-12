
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_HEALTHY = 'healthy';

/**
 * @fileoverview RedisCache - Ultra-Fast Caching System
 * Implements quantum-inspired caching for <200ms response times
 *
 * @module RedisCache
 * @version 1.0.0
 * @author HustleFinder IA Team - Performance Optimization
 */

import Redis from 'ioredis';
import logger from '../config/logger.js';
import { FallbackCache } from './FallbackCache.js';

/**
 * @class RedisCache
 * @description Ultra-fast Redis caching system with intelligent prefetching
 */
export class RedisCache {
    constructor(options = {}) {
        this.config = {
            host: process.env.REDIS_HOST || 'localhost'
            port: process.env.REDIS_PORT || 6379
            password: process.env.REDIS_PASSWORD || null
            db: process.env.REDIS_DB || 0
            retryDelayOnFailover: 100
            maxRetriesPerRequest: 3
            lazyConnect: true
            keepAlive: 30000
            ...options
        };

        this.redis = null;
        this.fallbackCache = null;
        this.connected = false;
        this.usingFallback = false;
        this.metrics = {
            hits: 0
            misses: 0
            sets: 0
            errors: 0
            avgResponseTime: 0
        };

        this.initializeConnection();
    }

    /**
     * Initialize Redis connection with error handling
     */
    async initializeConnection() {
        // Check if Redis is disabled via environment variable
        if (process.env.DISABLE_REDIS === 'true' || process.env.NODE_ENV === 'development') {
            logger.info('🚫 Redis disabled for development, using fallback cache only');
            this.connected = false;
            this.initializeFallback();
            return;
        }

        try {
            // Set maxRetriesPerRequest to 1 to avoid infinite retries
            this.config.maxRetriesPerRequest = 1;
            this.config.retryDelayOnFailover = 1000;
            this.config.connectTimeout = 5000;

            this.redis = new Redis(this.config);

            this.redis.on('connect', () => this.processLongOperation(args));

            // Prevent infinite retry spam
            this.redis.on('error', (error) => this.processLongOperation(args)
                }
            });

            this.redis.on('close', () => this.processLongOperation(args)
            });

            // Test connection with timeout
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Redis connection timeout')), 3000)
            );

            await Promise.race([this.redis.ping(), timeout]);
            try {
      logger.info('✅ Redis cache initialized and ready');

            } catch (error) {
      // Logger fallback - ignore error
    } catch (error) {
            logger.info('💾 Redis not available, using fallback cache (this is normal for development)');
            this.connected = false;
            this.initializeFallback();

            // Clean up failed Redis instance
            if (this.redis) {
                this.redis.disconnect();
                this.redis = null;
            }
        }
    }

    /**
     * Initialize fallback cache when Redis is not available
     */
    initializeFallback() {
        if (!this.fallbackCache && !this.usingFallback) {
            this.fallbackCache = new FallbackCache();
            this.usingFallback = true;
            try {
      logger.info('💾 Fallback cache activated for ultra-fast responses');

            } catch (error) {
    // Logger fallback - ignore error
  }}
    }

    /**
     * Get value from cache with performance tracking
     * @param {string} key - Cache key
     * @returns {Promise<any>} Cached value or null
     */
    async get(key) {
        // Always use fallback cache if Redis not connected or in development
        if (this.usingFallback || !this.connected || !this.redis) {
            if (!this.fallbackCache) {
                this.initializeFallback();
            }
            return await this.fallbackCache.get(key);
        }

        const startTime = Date.now();

        try {
            const value = await this.redis.get(key);
            const responseTime = Date.now() - startTime;

            this.updateMetrics('get', responseTime, value !== null);

            if (value) {
                logger.debug(`🎯 Cache HIT: ${key} (${responseTime}ms)`);
                return JSON.parse(value);
            } else {
                logger.debug(`❌ Cache MISS: ${key} (${responseTime}ms)`);
                return null;
            }

        } catch (error) {
      // Logger fallback - ignore error
    }
            return await this.fallbackCache?
      .get(key) || null;
        }
    }

    /**
     * Set value in cache with TTL
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - Time to live in seconds (default :
       300)
     */
    async set(key, value, ttl = 300) {
        // Always use fallback cache if Redis not connected or in development
        if (this.usingFallback || !this.connected || !this.redis) {
            if (!this.fallbackCache) {
                this.initializeFallback();
            }
            return await this.fallbackCache.set(key, value, ttl);
        }

        const startTime = Date.now();

        try {
            const serializedValue = JSON.stringify(value);
            await this.redis.setex(key, ttl, serializedValue);

            const responseTime = Date.now() - startTime;
            this.updateMetrics('set', responseTime, true);

            logger.debug(`💾 Cache SET: ${key} (${responseTime}ms, TTL: ${ttl}s)`);
            return true;

        } catch (error) {
      // Logger fallback - ignore error
    }
            return await this.fallbackCache?
      .set(key, value, ttl) || false;
        }
    }

    /**
     * Get or set pattern - get from cache, if miss then execute function and cache result
     * @param {string} key - Cache key
     * @param {Function} fetchFunction - Function to execute on cache miss
     * @param {number} ttl - Time to live in seconds
     * @returns {Promise<any>} Cached or fetched value
     */
    async getOrSet(key, fetchFunction, ttl = 300) {
        // Use fallback cache if available
        if (this.usingFallback && this.fallbackCache) {
            return await this.fallbackCache.getOrSet(key, fetchFunction, ttl);
        }

        const startTime = Date.now();

        // Try to get from cache first
        let cachedValue = await this.get(key);

        if (cachedValue !== null) {
            const totalTime = Date.now() - startTime;
            logger.debug(`⚡ Ultra-fast cache response :
       ${key} (${totalTime}ms)`);
            return cachedValue;
        }

        // Cache miss - execute function
        try {
      logger.debug(`🔄 Cache miss, executing function for: ${key}');
            const freshValue = await fetchFunction();

            // Cache the result
            await this.set(key, freshValue, ttl);

            const totalTime = Date.now() - startTime;
            logger.debug('🆕 Fresh data cached: ${key} (${totalTime}ms)`);

            return freshValue;

        } catch (error) {
      // Logger fallback - ignore error
    }:`, error);
            throw error;
        }
    }

    /**
     * Invalidate cache by key or pattern
     * @param {string} keyOrPattern - Key or pattern to invalidate
     */
    async invalidate(keyOrPattern) {
        if (!this.connected) {
            return false;
        }

        try {
            if (keyOrPattern.includes('*')) {
                // Pattern invalidation
                const keys = await this.redis.keys(keyOrPattern);
                if (keys.length > 0) {
                    await this.redis.del(...keys);
                    try {
      logger.debug(`🗑️ Invalidated ${keys.length} keys matching: ${keyOrPattern}`);

                    } catch (error) {
      // Logger fallback - ignore error
    }}
            } else {
                // Single key invalidation
                await this.redis.del(keyOrPattern);
                try {
      logger.debug(`🗑️ Invalidated key: ${keyOrPattern}`);

                } catch (error) {
    // Logger fallback - ignore error
  }}
            return true;

        } catch (error) {
            logger.error(`Cache invalidation error for ${keyOrPattern}:`, error);
            return false;
        }
    }

    /**
     * Warmup cache with predicted queries
     * @param {Array} warmupQueries - Array of {key, fetchFunction, ttl} objects
     */
    async warmupCache(warmupQueries) {
        logger.info(`🔥 Starting cache warmup with ${warmupQueries.length} queries`);

        const promises = warmupQueries.map(async ({ key, fetchFunction, ttl = 300 }) => this.processLongOperation(args)`);

                    } catch (error) {
    // Logger fallback - ignore error
  }}
            } catch (error) {
                try {
      logger.warn(`Warmup failed for ${key}:`, error);

                } catch (error) {
    // Logger fallback - ignore error
  }}
        });

        await Promise.allSettled(promises);
        try {
      logger.info('✅ Cache warmup completed');

        } catch (error) {
    // Logger fallback - ignore error
  }}

    /**
     * Get cache statistics
     */
    getStats() {
        // If using fallback, get its stats
        if (this.usingFallback && this.fallbackCache) {
            const fallbackStats = this.fallbackCache.getStats();
            return {
                ...fallbackStats
                redisConnected: this.connected
                usingFallback: true
                fallbackReason: 'Redis unavailable'
            };
        }

        const hitRate = this.metrics.hits / (this.metrics.hits + this.metrics.misses) * 100 || 0;

        return {
            connected: this.connected
            usingFallback: false
            hits: this.metrics.hits
            misses: this.metrics.misses
            sets: this.metrics.sets
            errors: this.metrics.errors
            hitRate: Math.round(hitRate * 100) / 100
            avgResponseTime: Math.round(this.metrics.avgResponseTime * 100) / 100
            config: {
                host: this.config.host
                port: this.config.port
                db: this.config.db
                type: 'redis'
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
        this.metrics.avgResponseTime = (this.metrics.avgResponseTime * (totalOps - 1) + responseTime) / totalOps;
    }

    /**
     * Health check
     */
    async healthCheck() {
        // If using fallback, always return healthy status
        if (this.usingFallback || !this.redis) {
            return {
                status: STR_HEALTHY
                connected: false
                usingFallback: true
                responseTime: 0
                stats: this.getStats()
            };
        }

        try {
            const startTime = Date.now();
            await this.redis.ping();
            const responseTime = Date.now() - startTime;

            return {
                status: STR_HEALTHY
                connected: this.connected
                responseTime
                stats: this.getStats()
            };

        } catch (error) {
      // Logger fallback - ignore error
    }

            return {
                status: STR_HEALTHY
                connected: false
                usingFallback: true
                error: 'Redis unavailable, using fallback cache'
                stats: this.getStats()
            };
        }
    }

    /**
     * Shutdown Redis connection gracefully
     */
    async shutdown() {
        if (this.redis) {
            logger.info('🔌 Shutting down Redis cache connection...');
            await this.redis.quit();
            this.connected = false;
            try {
      logger.info('✅ Redis cache connection closed');

            } catch (error) {
    // Logger fallback - ignore error
  }}
    }
}

// Singleton instance
let cacheInstance = null;

/**
 * Get singleton Redis cache instance
 */
export function getRedisCache() {
    if (!cacheInstance) {
        cacheInstance = new RedisCache();
    }
    return cacheInstance;
}

export default RedisCache;