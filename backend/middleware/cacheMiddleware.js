/**
 * Simple Cache Middleware for Railway deployment
 * Fixed all syntax errors for production stability
 */

import { getRedisCache } from '../cache/cacheManager.js';

/**
 * Creates an intelligent cache middleware with automatic TTL optimization
 * @param {Object} options - Cache configuration options
 * @returns {Function} Express middleware function
 */
export function createCacheMiddleware(options = {}) {
    const {
        defaultTTL = 300, // 5 minutes default
        keyGenerator = (req) => `api:${req.method}:${req.originalUrl}:${req.user?.id || 'anonymous'}`,
        shouldCache = (req, res) => req.method === 'GET' && res.statusCode === 200,
        varyBy = [], // Additional headers to vary cache key by
        skipPaths = ['/api/health', '/api/auth'],
        intelligentTTL = true
    } = options;

    const cache = getRedisCache();

    return async (req, res, next) => {
        // Skip caching for certain paths
        if (skipPaths.some(path => req.path.startsWith(path))) {
            return next();
        }

        // Generate cache key
        const cacheKey = keyGenerator(req);
        const startTime = Date.now();

        // Try to get from cache
        try {
            const cachedResponse = await cache.get(cacheKey);
            
            if (cachedResponse) {
                const parsed = JSON.parse(cachedResponse);
                res.set(parsed.headers || {});
                res.set('X-Cache', 'HIT');
                res.set('X-Cache-Key', cacheKey);
                return res.status(parsed.status || 200).json(parsed.data);
            }
        } catch (error) {
            
        }

        // Cache miss - proceed with request
        res.set('X-Cache', 'MISS');
        
        // Intercept response
        const originalSend = res.send;
        const originalJson = res.json;
        
        res.json = function(data) {
            if (shouldCache(req, res)) {
                const cacheData = {
                    data,
                    status: res.statusCode,
                    headers: res.getHeaders(),
                    timestamp: Date.now()
                };
                
                const ttl = intelligentTTL ? calculateIntelligentTTL(req, defaultTTL) : defaultTTL;
                cache.set(cacheKey, JSON.stringify(cacheData), ttl).catch(err => {
                    
                });
            }
            
            return originalJson.call(this, data);
        };
        
        next();
    };
}

/**
 * Calculate intelligent TTL based on request patterns
 */
function calculateIntelligentTTL(req, defaultTTL) {
    // Simple intelligent TTL logic
    if (req.path.includes('static') || req.path.includes('assets')) {
        return 3600; // 1 hour for static content
    }
    
    if (req.path.includes('user') || req.path.includes('profile')) {
        return 60; // 1 minute for user data
    }
    
    return defaultTTL;
}

/**
 * Simple cache clearing utility
 */
export async function clearCache(pattern = '*') {
    try {
        const cache = getRedisCache();
        await cache.flush();
        
    } catch (error) {
        
    }
}

export default createCacheMiddleware;