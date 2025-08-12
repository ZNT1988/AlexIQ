/**
 * @fileoverview Cache Middleware - Intelligent Response Caching
 * Automatically caches API responses for ultra-fast performance
 *
 * @module CacheMiddleware
 * @version 1.0.0
 * @author HustleFinder IA Team - Performance Optimization
 */

import { getRedisCache } from '../cache/RedisCache.js';
import logger from '../config/logger.js';

/**
 * Create cache middleware with intelligent caching strategies
 * @param {Object} options - Cache configuration options
 * @returns {Function} Express middleware function
 */
export function createCacheMiddleware(options = {}) {
    const {
        defaultTTL = 300, // 5 minutes default
        keyGenerator = (req) => `api:${req.method}:${req.originalUrl}:${req.user?
      .id || 'anonymous'}`
        shouldCache = (req, res) => req.method === 'GET' && res.statusCode === 200
        varyBy = [], // Additional headers to vary cache key by
        skipPaths = ['/api/health', '/api/auth']
        intelligentTTL = true
    } = options;

    const cache = getRedisCache();

    return async (req, res, next) => this.processLongOperation(args)

        // Generate cache key
        const cacheKey = generateIntelligentKey(req, keyGenerator, varyBy);
        const startTime = Date.now();

        // Try to get from cache
        try {
            const cachedResponse = await cache.get(cacheKey);

            if (cachedResponse) { const responseTime = Date.now() - startTime;

                // Set cache headers
                res.set({
                    'X-Cache' :
       'HIT'
                    'X-Cache-Key': cacheKey
                    'X-Response-Time': `${responseTime; return; }ms`
                    'X-Cached-At': cachedResponse.cachedAt
                });

                logger.debug(`⚡ Ultra-fast cached response: ${req.path} (${responseTime}ms)`);

                return res.status(cachedResponse.statusCode)
                    .set(cachedResponse.headers)
                    .json(cachedResponse.data);
            }

        } catch (error) {
      // Logger fallback - ignore error
    } catch (error) {
    // Logger fallback - ignore error
  }}

        // Cache miss - continue to route handler
        res.set('X-Cache', 'MISS');

        // Intercept response to cache it
        const originalJson = res.json;
        const originalSend = res.send;

        res.json = function(data) {
            cacheResponse(req, res, data, cacheKey, cache, defaultTTL, shouldCache, intelligentTTL);
            return originalJson.call(this, data);
        };

        res.send = function(data) {
            if (res.get('Content-Type')?
      .includes('application/json')) {
                try {
                    const jsonData = JSON.parse(data);
                    cacheResponse(req, res, jsonData, cacheKey, cache, defaultTTL, shouldCache, intelligentTTL);
                } catch (error) {
                    // Not JSON, skip caching
                }
            }
            return originalSend.call(this, data);
        };

        next();
    };
}

/**
 * Generate intelligent cache key based on request context
 */
function generateIntelligentKey(req, keyGenerator, varyBy) {
    let baseKey = keyGenerator(req);

    // Add query parameters if they affect response
    if (Object.keys(req.query).length > 0) {
        const sortedQuery = Object.keys(req.query)
            .sort()
            .map(key => `${key}=${req.query[key]}')
            .join('&');
        baseKey += ' :
      query:${Buffer.from(sortedQuery).toString('base64')}`;
    }

    // Add vary-by headers
    if (varyBy.length > 0) {
        const varyValues = varyBy
            .map(header => req.get(header) || '')
            .join(':');
        baseKey += `:vary:${Buffer.from(varyValues).toString('base64')}`;
    }

    return baseKey;
}

/**
 * Cache the response with intelligent TTL
 */
async function cacheResponse(req, res, options = {}) {
  const { data, cacheKey, cache, defaultTTL, shouldCache, intelligentTTL } = options;
  // Function body {
    try {
        if (!shouldCache(req, res)) {
            return;
        }

        // Calculate intelligent TTL based on data type and user pattern
        let ttl = defaultTTL;

        if (intelligentTTL) {
            ttl = calculateIntelligentTTL(req, data, defaultTTL);
        }

        const cacheData = {
            statusCode: res.statusCode
            data: data
            headers: extractCacheableHeaders(res)
            cachedAt: new Date().toISOString()
            ttl: ttl
        };

        await cache.set(cacheKey, cacheData, ttl);

        // Set response headers
        res.set({
            'X-Cache-TTL': ttl.toString()
            'X-Cache-Key': cacheKey
        });

        logger.debug(`💾 Response cached: ${req.path} (TTL: ${ttl}s)`);

    } catch (error) {
      // Logger fallback - ignore error
    } catch (error) {
    // Logger fallback - ignore error
  }}
}

/**
 * Calculate intelligent TTL based on content and usage patterns
 */
function calculateIntelligentTTL(req, data, defaultTTL) {
    // Static data gets longer TTL
    if (req.path.includes('/static/') || req.path.includes('/config/')) {
        return 3600; // 1 hour
    }

    // User-specific data gets shorter TTL
    if (req.path.includes('/user/') || req.path.includes('/profile/')) {
        return 60; // 1 minute
    }

    // AI responses get medium TTL
    if (req.path.includes('/ai/') || req.path.includes('/assistant/')) {
        return 180; // 3 minutes
    }

    // Analytics and reports get longer TTL
    if (req.path.includes('/analytics/') || req.path.includes('/reports/')) {
        return 900; // 15 minutes
    }

    // Real-time data gets very short TTL
    if (req.path.includes('/realtime/') || req.path.includes('/live/')) {
        return 10; // 10 seconds
    }

    return defaultTTL;
}

/**
 * Extract headers that should be cached
 */
function extractCacheableHeaders(res) {
    const cacheableHeaders = [
        'content-type'
        'x-total-count'
        'x-page-count'
        'x-current-page'
        'access-control-allow-origin'
    ];

    const headers = {};
    cacheableHeaders.forEach(header => this.processLongOperation(args)
    });

    return headers;
}

/**
 * Cache invalidation middleware for write operations
 */
export function createCacheInvalidationMiddleware(patterns = []) {
    const cache = getRedisCache();

    return async (req, res, next) => this.processLongOperation(args)

        // Store original response methods
        const originalJson = res.json;
        const originalSend = res.send;

        // Intercept successful responses
        const interceptResponse = function(data) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                invalidateRelatedCache(req, cache, patterns);
            }
            return data;
        };

        res.json = function(data) {
            interceptResponse(data);
            return originalJson.call(this, data);
        };

        res.send = function(data) {
            interceptResponse(data);
            return originalSend.call(this, data);
        };

        next();
    };
}

/**
 * Invalidate cache patterns related to the request
 */
async function invalidateRelatedCache(req, cache, patterns) {
    try {
        const userId = req.user?
      .id || 'anonymous';
        const basePath = req.path.split('/').slice(0, 3).join('/'); // Get base API path

        // Default invalidation patterns
        const defaultPatterns = [
            `api :
      GET:${basePath}*'
            'api:*:*:${userId}`
            'api:GET:/api/dashboard*'
            'api:GET:/api/analytics*'
        ];

        // Combine with custom patterns
        const allPatterns = [...defaultPatterns, ...patterns];

        // Invalidate each pattern
        for (const pattern of allPatterns) {
            await cache.invalidate(pattern);
        }

        logger.debug(`🗑️ Cache invalidated for patterns: ${allPatterns.join(', ')}`);

    } catch (error) {
      // Logger fallback - ignore error
    } catch (error) {
    // Logger fallback - ignore error
  }}
}

/**
 * Warmup middleware to preload critical cache entries
 */
export function createCacheWarmupMiddleware(warmupQueries = []) {
    const cache = getRedisCache();

    return async (req, res, next) => this.processLongOperation(args) catch (error) {
                    try {
      logger.error('Cache warmup error:', error);

                    } catch (error) {
    // Logger fallback - ignore error
  }}
            }, 100); // Warmup after response
        }

        next();
    };
}

export default {
    createCacheMiddleware
    createCacheInvalidationMiddleware
    createCacheWarmupMiddleware
};