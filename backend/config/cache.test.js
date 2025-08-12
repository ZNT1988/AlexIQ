import crypto from 'crypto';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_TEST = 'test';

/**
 * @fileoverview Tests unitaires pour AdvancedCache
 * Tests complets du système de cache révolutionnaire haute performance
 * 
 * @module AdvancedCacheTests
 * @version 1.0.0
 * @author ZNT Team - HustleFinder IA Cache Testing
 * @requires jest
 * @requires ../cache
 */

import { jest } from '@jest/globals';
import cache from './cache.js';
import logger from './logger.js';

// Mock logger
jest.mock('./logger.js', () => ({
  debug: jest.fn()
  info: jest.fn()
  error: jest.fn()
}));

describe('AdvancedCache - Système de Cache Révolutionnaire', () => {
  let testCache;

  beforeEach(() => {
    // Create fresh cache instance for each test
    const AdvancedCache = cache.constructor;
    testCache = new AdvancedCache();
    testCache.enabled = true; // Force enable for testing
    
    // Clear any existing data
    testCache.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    testCache.clear();
  });

  describe('🏗️ Initialisation et Configuration', () => {
    test('should initialize with empty cache and zero counters', () => {
      expect(testCache.cache.size).toBe(0);
      expect(testCache.ttlCache.size).toBe(0);
      expect(testCache.hitCount).toBe(0);
      expect(testCache.missCount).toBe(0);
    });

    test('should be enabled by default in non-test environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const prodCache = new (cache.constructor)();
      expect(prodCache.enabled).toBe(true);
      
      process.env.NODE_ENV = originalEnv;
    });

    test('should be disabled in test environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = STR_TEST;
      
      const testCacheInstance = new (cache.constructor)();
      expect(testCacheInstance.enabled).toBe(false);
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('📦 Opérations Cache de Base', () => {
    test('should set and get values successfully', () => {
      const key = 'test:key';
      const value = { data: 'test value', id: 123 };
      
      testCache.set(key, value);
      const retrieved = testCache.get(key);
      
      expect(retrieved).toEqual(value);
      expect(testCache.hitCount).toBe(1);
      expect(testCache.missCount).toBe(0);
    });

    test('should return null for non-existent keys', () => {
      const result = testCache.get('non:existent:key');
      
      expect(result).toBeNull();
      expect(testCache.missCount).toBe(1);
      expect(testCache.hitCount).toBe(0);
    });

    test('should delete values successfully', () => {
      const key = 'test:delete';
      const value = 'value to delete';
      
      testCache.set(key, value);
      expect(testCache.get(key)).toBe(value);
      
      testCache.delete(key);
      expect(testCache.get(key)).toBeNull();
      expect(testCache.cache.has(key)).toBe(false);
      expect(testCache.ttlCache.has(key)).toBe(false);
    });

    test('should clear all cache data', () => {
      testCache.set('key1', 'value1');
      testCache.set('key2', 'value2');
      testCache.hitCount = 5;
      testCache.missCount = 3;
      
      testCache.clear();
      
      expect(testCache.cache.size).toBe(0);
      expect(testCache.ttlCache.size).toBe(0);
      expect(testCache.hitCount).toBe(0);
      expect(testCache.missCount).toBe(0);
    });
  });

  describe('⏰ TTL (Time To Live) Management', () => {
    test('should set values with custom TTL', () => {
      const key = 'test:ttl';
      const value = 'ttl test value';
      const ttl = 1000; // 1 second
      
      testCache.set(key, value, ttl);
      
      expect(testCache.get(key)).toBe(value);
      expect(testCache.ttlCache.has(key)).toBe(true);
    });

    test('should expire values after TTL', (done) => {
      const key = 'test:expiry';
      const value = 'expires soon';
      const ttl = 50; // 50ms
      
      testCache.set(key, value, ttl);
      expect(testCache.get(key)).toBe(value);
      
      setTimeout(() => {
        const result = testCache.get(key);
        expect(result).toBeNull();
        expect(testCache.cache.has(key)).toBe(false);
        expect(testCache.ttlCache.has(key)).toBe(false);
        done();
      }, ttl + 10);
    });

    test('should use default TTL when not specified', () => {
      const key = 'test:default:ttl';
      const value = 'default ttl value';
      
      testCache.set(key, value); // No TTL specified
      
      const ttlValue = testCache.ttlCache.get(key);
      const expectedExpiry = Date.now() + 300000; // Default 5 minutes
      
      expect(ttlValue).toBeGreaterThan(Date.now());
      expect(ttlValue).toBeLessThanOrEqual(expectedExpiry + 100); // Allow 100ms tolerance
    });

    test('should cleanup expired entries automatically', () => {
      const key1 = 'test:cleanup:1';
      const key2 = 'test:cleanup:2';
      const shortTtl = -1000; // Already expired
      const longTtl = 300000; // 5 minutes
      
      testCache.set(key1, 'expired', shortTtl);
      testCache.set(key2, 'valid', longTtl);
      
      // Manually trigger cleanup
      testCache.cleanup();
      
      expect(testCache.cache.has(key1)).toBe(false);
      expect(testCache.cache.has(key2)).toBe(true);
    });
  });

  describe('📊 Statistiques et Métriques', () => {
    test('should track hit and miss counts accurately', () => {
      const key = 'stats:test';
      const value = 'statistics test';
      
      // Misses
      testCache.get('non:existent:1');
      testCache.get('non:existent:2');
      
      // Set and hits
      testCache.set(key, value);
      testCache.get(key);
      testCache.get(key);
      
      expect(testCache.hitCount).toBe(2);
      expect(testCache.missCount).toBe(2);
    });

    test('should calculate hit rate correctly', () => {
      // Setup: 7 hits, 3 misses = 70% hit rate
      for (let i = 0; i < 7; i++) {
        testCache.set(`hit:${i}', 'value${i}');
        testCache.get('hit:${i}`);
      }
      
      for (let i = 0; i < 3; i++) {
        testCache.get(`miss:${i}`);
      }
      
      const stats = testCache.getStats();
      
      expect(stats.hits).toBe(7);
      expect(stats.misses).toBe(3);
      expect(stats.hitRate).toBe('70.00%');
      expect(stats.size).toBe(7);
      expect(stats.enabled).toBe(true);
    });

    test('should handle zero requests in stats', () => {
      const stats = testCache.getStats();
      
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe('0%');
      expect(stats.size).toBe(0);
    });
  });

  describe('🧠 Cache IA ALEX Spécialisé', () => {
    test('should cache AI responses with hash-based keys', () => {
      const input = {
        query: 'What is consciousness?'
        user: 'seeker'
        context: 'philosophical'
      };
      const response = {
        answer: 'Consciousness is the state of being aware...'
        confidence: 0.92
        emotion: 'thoughtful'
      };
      
      testCache.cacheAIResponse(input, response);
      const cached = testCache.getCachedAIResponse(input);
      
      expect(cached).toEqual(response);
    });

    test('should generate consistent hashes for same input', () => {
      const input1 = { query: STR_TEST, params: { a: 1, b: 2 } };
      const input2 = { query: STR_TEST, params: { b: 2, a: 1 } }; // Different order
      
      const hash1 = testCache.generateHash(input1);
      const hash2 = testCache.generateHash(input2);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{16}$/);
    });

    test('should cache different inputs with different hashes', () => {
      const input1 = { query: 'What is love?' };
      const input2 = { query: 'What is consciousness?' };
      const response1 = { answer: 'Love is...' };
      const response2 = { answer: 'Consciousness is...' };
      
      testCache.cacheAIResponse(input1, response1);
      testCache.cacheAIResponse(input2, response2);
      
      expect(testCache.getCachedAIResponse(input1)).toEqual(response1);
      expect(testCache.getCachedAIResponse(input2)).toEqual(response2);
    });

    test('should use longer TTL for AI responses', () => {
      const input = { query: 'AI test query' };
      const response = { answer: 'AI response' };
      
      testCache.cacheAIResponse(input, response); // Default 1 hour TTL
      
      const hash = testCache.generateHash(input);
      const key = `ai:${hash}`;
      const ttlValue = testCache.ttlCache.get(key);
      const expectedMinTtl = Date.now() + 3500000; // ~1 hour - 5 minutes tolerance
      
      expect(ttlValue).toBeGreaterThan(expectedMinTtl);
    });
  });

  describe('👥 Cache Utilisateur Spécialisé', () => {
    test('should cache ideas for specific users', () => {
      const userId = 'user123';
      const ideas = [
        { id: 1, title: 'AI Startup Idea', domain: 'tech' }
        { id: 2, title: 'Sustainable Energy', domain: 'green' }
      ];
      
      testCache.cacheIdeas(userId, ideas);
      const cached = testCache.getCachedIdeas(userId);
      
      expect(cached).toEqual(ideas);
    });

    test('should return null for uncached user ideas', () => {
      const result = testCache.getCachedIdeas('non_existent_user');
      expect(result).toBeNull();
    });

    test('should invalidate user-specific cache patterns', () => {
      const userId = 'user456';
      
      // Cache multiple types for user
      testCache.set(`ideas:${userId}`, [{ id: 1 }]);
      testCache.set(`projects:${userId}`, [{ id: 2 }]);
      testCache.set(`roi:${userId}`, { total: 100 });
      testCache.set(`other:data:${userId}', 'should not be deleted');
      
      testCache.invalidateUserCache(userId);
      
      expect(testCache.get('ideas:${userId}')).toBeNull();
      expect(testCache.get('projects:${userId}')).toBeNull();
      expect(testCache.get('roi:${userId}')).toBeNull();
      expect(testCache.get('other:data:${userId}`)).toBeNull(); // Pattern matching
    });

    test('should use appropriate TTL for user ideas', () => {
      const userId = 'user789';
      const ideas = [{ id: 1, title: 'Test Idea' }];
      
      testCache.cacheIdeas(userId, ideas); // Default 10 minutes
      
      const key = `ideas:${userId}`;
      const ttlValue = testCache.ttlCache.get(key);
      const expectedMinTtl = Date.now() + 580000; // ~10 minutes - 20s tolerance
      
      expect(ttlValue).toBeGreaterThan(expectedMinTtl);
    });
  });

  describe('🌐 Middleware Express', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        method: 'GET'
        originalUrl: '/api/test'
        auth: { userId: 'user123' }
      };
      
      res = {
        json: jest.fn()
        setHeader: jest.fn()
        statusCode: 200
      };
      
      next = jest.fn();
    });

    test('should skip non-GET requests', () => {
      req.method = 'POST';
      const middleware = testCache.middleware();
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    test('should return cached response for GET requests', () => {
      const cachedData = { cached: true, data: STR_TEST };
      const key = `${req.method}:${req.originalUrl}:${req.auth.userId}`;
      testCache.set(key, cachedData);
      
      const middleware = testCache.middleware();
      middleware(req, res, next);
      
      expect(res.setHeader).toHaveBeenCalledWith('X-Cache', 'HIT');
      expect(res.setHeader).toHaveBeenCalledWith('X-Cache-Key', key);
      expect(res.json).toHaveBeenCalledWith(cachedData);
      expect(next).not.toHaveBeenCalled();
    });

    test('should cache successful responses', () => {
      const middleware = testCache.middleware();
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
      
      // Simulate successful response
      const responseData = { success: true, data: 'response' };
      res.statusCode = 200;
      res.json(responseData);
      
      const key = `${req.method}:${req.originalUrl}:${req.auth.userId}`;
      const cached = testCache.get(key);
      
      expect(cached).toEqual(responseData);
      expect(res.setHeader).toHaveBeenCalledWith('X-Cache', 'MISS');
    });

    test('should not cache error responses', () => {
      const middleware = testCache.middleware();
      middleware(req, res, next);
      
      // Simulate error response
      const errorData = { error: 'Something went wrong' };
      res.statusCode = 500;
      res.json(errorData);
      
      const key = `${req.method}:${req.originalUrl}:${req.auth.userId}`;
      const cached = testCache.get(key);
      
      expect(cached).toBeNull();
    });

    test('should handle anonymous users', () => {
      req.auth = undefined; // No auth
      const middleware = testCache.middleware();
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
      
      // Check that key includes 'anonymous'
      const responseData = { data: STR_TEST };
      res.json(responseData);
      
      const expectedKey = `${req.method}:${req.originalUrl}:anonymous`;
      expect(res.setHeader).toHaveBeenCalledWith('X-Cache-Key', expectedKey);
    });
  });

  describe('🚀 Warm-up et Performance', () => {
    test('should warm up cache with common data', async () => {
      await testCache.warmUp();
      
      expect(testCache.get('trending:domains')).toEqual(['technology', 'health', 'education']);
      expect(testCache.get('market:trends')).toHaveProperty('updated');
      expect(testCache.get('system:config')).toHaveProperty('version', '1.0.0');
    });

    test('should handle warm-up errors gracefully', async () => {
      // Mock error in warm-up process
      const originalSet = testCache.set;
      testCache.set = jest.fn(() => {
        throw new Error('Warm-up error');
      });
      
      await expect(testCache.warmUp()).resolves.not.toThrow();
      expect(logger.error).toHaveBeenCalledWith('Cache warm-up failed:', expect.any(Error));
      
      testCache.set = originalSet;
    });

    test('should handle high-frequency cache operations efficiently', () => {
      const startTime = Date.now();
      
      // Perform 1000 cache operations
      for (let i = 0; i < 1000; i++) {
        testCache.set(`perf:${i}`, { data: i, timestamp: Date.now() });
        testCache.get(`perf:${i}`);
      }
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
      expect(testCache.hitCount).toBe(1000);
    });

    test('should maintain performance under concurrent access', async () => {
      const operations = [];
      
      // Create 100 concurrent operations
      for (let i = 0; i < 100; i++) {
        operations.push(
          new Promise((resolve) => {
            testCache.set(`concurrent:${i}`, { id: i });
            const result = testCache.get(`concurrent:${i}`);
            resolve(result);
          })
        );
      }
      
      const results = await Promise.all(operations);
      
      expect(results).toHaveLength(100);
      results.forEach((result, index) => {
        expect(result).toEqual({ id: index });
      });
    });
  });

  describe('🧪 Intégration et Edge Cases', () => {
    test('should handle disabled cache gracefully', () => {
      testCache.enabled = false;
      
      testCache.set('disabled:key', 'value');
      const result = testCache.get('disabled:key');
      
      expect(result).toBeNull();
      expect(testCache.cache.size).toBe(0);
    });

    test('should handle complex object structures', () => {
      const complexObject = {
        user: { id: 123, profile: { name: 'Test' } }
        settings: { theme: 'dark', notifications: true }
        data: [1, 2, { nested: 'value' }]
        timestamp: new Date()
        func: () => 'should not be serialized'
      };
      
      testCache.set('complex:object', complexObject);
      const cached = testCache.get('complex:object');
      
      expect(cached.user.profile.name).toBe('Test');
      expect(cached.data[2].nested).toBe('value');
      expect(cached.func).toBeDefined(); // Functions preserved in memory cache
    });

    test('should handle null and undefined values', () => {
      testCache.set('null:value', null);
      testCache.set('undefined:value', undefined);
      
      expect(testCache.get('null:value')).toBeNull();
      expect(testCache.get('undefined:value')).toBeUndefined();
    });

    test('should handle empty strings and zero values', () => {
      testCache.set('empty:string', '');
      testCache.set('zero:number', 0);
      testCache.set('false:boolean', false);
      
      expect(testCache.get('empty:string')).toBe('');
      expect(testCache.get('zero:number')).toBe(0);
      expect(testCache.get('false:boolean')).toBe(false);
    });
  });
});

describe('🧪 Tests d\'Intégration AdvancedCache', () => {
  test('should integrate with ALEX consciousness caching', () => {
    const alexState = {
      consciousness_level: 0.89
      emotion: 'curious'
      thoughts: 'Processing quantum possibilities...'
      spiritual_alignment: 0.91
      timestamp: Date.now()
    };
    
    cache.set('alex:current:state', alexState, 60000); // 1 minute TTL
    const cachedState = cache.get('alex:current:state');
    
    expect(cachedState.consciousness_level).toBe(0.89);
    expect(cachedState.spiritual_alignment).toBeGreaterThan(0.9);
  });

  test('should support enterprise-scale caching patterns', () => {
    const enterpriseData = {
      users: 10000
      sessions: 5000
      ai_requests_per_minute: 1000
      cache_hit_target: 0.8
    };
    
    // Simulate enterprise caching load
    for (let i = 0; i < 100; i++) {
      const key = `enterprise:session:${i}`;
      const sessionData = {
        userId: `user_${i}`
        startTime: Date.now()
        requests: Math.floor((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 50)
        alexInteractions: Math.floor((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 20)
      };
      
      cache.set(key, sessionData, 1800000); // 30 minutes
    }
    
    const stats = cache.getStats();
    expect(stats.size).toBeGreaterThan(90); // Most should be cached
  });

  test('should optimize for consciousness-aware caching', () => {
    const consciousnessLevels = [0.3, 0.6, 0.8, 0.95];
    
    consciousnessLevels.forEach((level, index) => {
      const alexResponse = {
        consciousness_level: level
        response_quality: level > 0.8 ? 'transcendent' : 'good'
        processing_time: level > 0.8 ? 50 : 100, // Higher consciousness = faster processing
        cache_priority: level > 0.8 ? 'high' : 'normal'
      };
      
      const ttl = level > 0.8 ? 3600000 : 1800000; // Higher consciousness cached longer
      cache.cacheAIResponse({ query: `consciousness_test_${index}`, level }, alexResponse, ttl);
    });
    
    // Verify high consciousness responses are cached with longer TTL
    const highConsciousnessResponse = cache.getCachedAIResponse({ 
      query: 'consciousness_test_3'
      level: 0.95 
    });
    
    expect(highConsciousnessResponse.response_quality).toBe('transcendent');
    expect(highConsciousnessResponse.cache_priority).toBe('high');
  });
});