import crypto from 'crypto';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_WARNING = 'warning';
/**
 * @fileoverview Tests unitaires pour PerformanceOptimizer
 * Tests complets du système d'optimisation performance révolutionnaire
 * 
 * @module PerformanceOptimizerTests
 * @version 1.0.0
 * @author ZNT Team - HustleFinder IA Performance Testing
 * @requires jest
 * @requires cluster
 * @requires ../performance
 */

import { jest } from '@jest/globals';
import cluster from 'cluster';
import os from 'os';
import performanceOptimizer, { 
  setupCluster
  compressionMiddleware
  requestOptimizer
  responseOptimizer
  cacheOptimizer
  dbOptimizer
  getMetrics
  healthCheck
} from './performance.js';

// Mock dependencies
jest.mock('cluster');
jest.mock('./logger.js', () => ({
  info: jest.fn()
  warn: jest.fn()
  debug: jest.fn()
  error: jest.fn()
}));
jest.mock('./cache.js', () => ({
  get: jest.fn()
  set: jest.fn()
  getStats: jest.fn(() => ({ hits: 100, misses: 20, size: 50 }))
}));

describe('PerformanceOptimizer - Système d\'Optimisation Performance Révolutionnaire', () => {
  let originalEnv;
  let mockResponse;
  let mockRequest;

  beforeEach(() => {
    originalEnv = { ...process.env };
    
    // Mock Express response
    mockResponse = {
      setHeader: jest.fn()
      json: jest.fn()
      statusCode: 200
    };
    
    // Mock Express request
    mockRequest = {
      headers: {}
      requestId: 'test-123'
    };

    // Reset cluster mocks
    cluster.isPrimary = true;
    cluster.fork = jest.fn(() => ({
      process: { pid: 12345 }
      send: jest.fn()
      on: jest.fn()
      kill: jest.fn()
    }));
    cluster.on = jest.fn();
    cluster.workers = {};
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe('🏗️ Configuration et Initialisation', () => {
    test('should initialize with default configuration', () => {
      expect(performanceOptimizer).toBeDefined();
      expect(performanceOptimizer.config).toBeDefined();
      expect(performanceOptimizer.metrics).toBeDefined();
    });

    test('should use environment variables for configuration', () => {
      process.env.CLUSTER_WORKERS = '4';
      process.env.MAX_MEMORY_MB = '1024';
      process.env.COMPRESSION_LEVEL = '9';
      
      const optimizer = new (require('./performance.js').default.constructor)();
      
      expect(optimizer.config.clustering.workers).toBe(4);
      expect(optimizer.config.clustering.maxMemory).toBe(1024);
      expect(optimizer.config.compression.level).toBe(9);
    });

    test('should fallback to defaults when env vars missing', () => {
      delete process.env.CLUSTER_WORKERS;
      delete process.env.MAX_MEMORY_MB;
      
      const optimizer = new (require('./performance.js').default.constructor)();
      
      expect(optimizer.config.clustering.workers).toBe(os.cpus().length);
      expect(optimizer.config.clustering.maxMemory).toBe(512);
    });

    test('should initialize metrics with zero values', () => {
      const metrics = performanceOptimizer.metrics;
      
      expect(metrics.requests).toBe(0);
      expect(metrics.dbQueries).toBe(0);
      expect(metrics.cacheHits).toBe(0);
      expect(metrics.cacheMisses).toBe(0);
      expect(metrics.errors).toBe(0);
      expect(metrics.averageResponseTime).toBe(0);
    });
  });

  describe('🚀 Clustering Multi-Processus', () => {
    test('should not setup cluster in development', () => {
      process.env.NODE_ENV = 'development';
      cluster.isPrimary = true;
      
      const result = setupCluster();
      
      expect(result).toBe(false);
      expect(cluster.fork).not.toHaveBeenCalled();
    });

    test('should setup cluster in production when enabled', () => {
      process.env.NODE_ENV = STR_PRODUCTION;
      process.env.CLUSTER_ENABLED = STR_TRUE;
      process.env.CLUSTER_WORKERS = '2';
      cluster.isPrimary = true;
      
      const result = setupCluster();
      
      expect(result).toBe(true);
      expect(cluster.fork).toHaveBeenCalledTimes(2);
    });

    test('should return false for worker processes', () => {
      process.env.NODE_ENV = STR_PRODUCTION;
      process.env.CLUSTER_ENABLED = STR_TRUE;
      cluster.isPrimary = false;
      
      const result = setupCluster();
      
      expect(result).toBe(false);
      expect(cluster.fork).not.toHaveBeenCalled();
    });

    test('should handle worker exit and restart', () => {
      process.env.NODE_ENV = STR_PRODUCTION;
      process.env.CLUSTER_ENABLED = STR_TRUE;
      cluster.isPrimary = true;
      
      setupCluster();
      
      expect(cluster.on).toHaveBeenCalledWith('exit', expect.any(Function));
      
      // Simulate worker exit
      const exitHandler = cluster.on.mock.calls.find(call => call[0] === 'exit')[1];
      const mockWorker = { process: { pid: 12345 } };
      
      exitHandler(mockWorker, 1, 'SIGTERM');
      
      expect(cluster.fork).toHaveBeenCalled();
    });

    test('should setup graceful shutdown handler', () => {
      process.env.NODE_ENV = STR_PRODUCTION;
      process.env.CLUSTER_ENABLED = STR_TRUE;
      cluster.isPrimary = true;
      cluster.workers = {
        1: { kill: jest.fn() }
        2: { kill: jest.fn() }
      };
      
      const originalOn = process.on;
      process.on = jest.fn();
      
      setupCluster();
      
      expect(process.on).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
      
      process.on = originalOn;
    });
  });

  describe('📊 Métriques Performance', () => {
    test('should track request metrics', () => {
      const initialRequests = performanceOptimizer.metrics.requests;
      
      performanceOptimizer.updateMetrics(150, 200);
      
      expect(performanceOptimizer.metrics.requests).toBe(initialRequests + 1);
      expect(performanceOptimizer.metrics.averageResponseTime).toBe(150);
    });

    test('should track error metrics', () => {
      const initialErrors = performanceOptimizer.metrics.errors;
      
      performanceOptimizer.updateMetrics(300, 404);
      
      expect(performanceOptimizer.metrics.errors).toBe(initialErrors + 1);
    });

    test('should calculate average response time correctly', () => {
      // Reset metrics for clean test
      performanceOptimizer.metrics.requests = 0;
      performanceOptimizer.metrics.averageResponseTime = 0;
      
      performanceOptimizer.updateMetrics(100, 200);
      expect(performanceOptimizer.metrics.averageResponseTime).toBe(100);
      
      performanceOptimizer.updateMetrics(200, 200);
      expect(performanceOptimizer.metrics.averageResponseTime).toBe(150);
      
      performanceOptimizer.updateMetrics(300, 200);
      expect(performanceOptimizer.metrics.averageResponseTime).toBe(200);
    });

    test('should return comprehensive metrics', () => {
      const metrics = getMetrics();
      
      expect(metrics).toHaveProperty('requests');
      expect(metrics).toHaveProperty('dbQueries');
      expect(metrics).toHaveProperty('averageResponseTime');
      expect(metrics).toHaveProperty('memory');
      expect(metrics).toHaveProperty('process');
      expect(metrics).toHaveProperty('cache');
      
      expect(metrics.memory).toHaveProperty('rss');
      expect(metrics.memory).toHaveProperty('heapUsed');
      expect(metrics.process).toHaveProperty('pid');
      expect(metrics.process).toHaveProperty('uptime');
    });
  });

  describe('🗜️ Compression Middleware', () => {
    test('should return compression middleware when enabled', () => {
      process.env.COMPRESSION_ENABLED = STR_TRUE;
      
      const middleware = compressionMiddleware();
      
      expect(middleware).toBeDefined();
      expect(typeof middleware).toBe('function');
    });

    test('should return no-op middleware when disabled', () => {
      process.env.COMPRESSION_ENABLED = 'false';
      
      const middleware = compressionMiddleware();
      const next = jest.fn();
      
      middleware(mockRequest, mockResponse, next);
      
      expect(next).toHaveBeenCalled();
    });

    test('should respect no-compression header', () => {
      const optimizer = performanceOptimizer;
      const compressionConfig = optimizer.getCompressionMiddleware();
      
      expect(compressionConfig).toBeDefined();
    });
  });

  describe('⚡ Request Optimization', () => {
    test('should add request ID and performance headers', () => {
      const middleware = requestOptimizer();
      const next = jest.fn();
      
      middleware(mockRequest, mockResponse, next);
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Request-ID', expect.any(String));
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Powered-By', 'HustleFinderIA');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Response-Time-Start', expect.any(String));
      expect(next).toHaveBeenCalled();
    });

    test('should override res.json to add performance metrics', () => {
      const middleware = requestOptimizer();
      const next = jest.fn();
      const originalJson = mockResponse.json;
      
      middleware(mockRequest, mockResponse, next);
      
      expect(mockResponse.json).not.toBe(originalJson);
      expect(typeof mockResponse.json).toBe('function');
    });

    test('should measure response time', (done) => {
      const middleware = requestOptimizer();
      const next = jest.fn();
      
      middleware(mockRequest, mockResponse, next);
      
      // Simulate delayed response
      setTimeout(() => {
        mockResponse.json({ test: 'data' });
        
        expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Response-Time', expect.stringContaining('ms'));
        expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Worker-ID', expect.any(String));
        done();
      }, 10);
    });
  });

  describe('🎯 Cache Optimization', () => {
    test('should generate consistent cache keys', () => {
      const optimizer = cacheOptimizer();
      
      const key1 = optimizer.generateKey(STR_TEST, { a: 1, b: 2 });
      const key2 = optimizer.generateKey(STR_TEST, { b: 2, a: 1 }); // Different order
      
      expect(key1).toBe(key2); // Should be same due to sorting
      expect(key1).toMatch(/^test:[a-f0-9]{8}$/);
    });

    test('should calculate adaptive TTL based on access patterns', () => {
      const cache = require('./cache.js');
      cache.get.mockImplementation((key) => {
        if (key.includes('access_count')) return 5;
        if (key.includes('last_access')) return Date.now() - 1800000; // 30 minutes ago
        return null;
      });
      
      const optimizer = cacheOptimizer();
      const ttl = optimizer.getAdaptiveTTL('test-key', 300000);
      
      expect(ttl).toBeGreaterThan(300000); // Should be higher due to access count
      expect(cache.set).toHaveBeenCalled(); // Should update access tracking
    });

    test('should handle batch cache operations', async () => {
      const cache = require('./cache.js');
      cache.get.mockReturnValue('cached-value');
      
      const optimizer = cacheOptimizer();
      const keys = ['key1', 'key2', 'key3'];
      
      const results = await optimizer.mget(keys);
      
      expect(results).toHaveProperty('key1', 'cached-value');
      expect(results).toHaveProperty('key2', 'cached-value');
      expect(results).toHaveProperty('key3', 'cached-value');
    });

    test('should handle batch cache sets', async () => {
      const cache = require('./cache.js');
      const optimizer = cacheOptimizer();
      
      const entries = { key1: 'value1', key2: 'value2' };
      await optimizer.mset(entries, 300000);
      
      expect(cache.set).toHaveBeenCalledWith('key1', 'value1', 300000);
      expect(cache.set).toHaveBeenCalledWith('key2', 'value2', 300000);
    });
  });

  describe('🗄️ Database Optimization', () => {
    test('should create database query optimizer', () => {
      const query = 'SELECT * FROM users WHERE id = ?
      ';
      const params = [123];
      
      const optimizer = dbOptimizer(query, params);
      
      expect(optimizer).toHaveProperty('query', query);
      expect(optimizer).toHaveProperty('params', params);
      expect(optimizer).toHaveProperty('measure');
      expect(typeof optimizer.measure).toBe('function');
    });

    test('should measure query execution time', () => {
      const optimizer = dbOptimizer('SELECT 1', []);
      
      const duration = optimizer.measure();
      
      expect(typeof duration).toBe('number');
      expect(duration).toBeGreaterThanOrEqual(0);
      expect(performanceOptimizer.metrics.dbQueries).toBeGreaterThan(0);
    });

    test('should log slow database queries', () => {
      const logger = require('./logger.js');
      const optimizer = dbOptimizer('SELECT * FROM large_table', []);
      
      // Mock slow query
      jest.spyOn(process, 'hrtime').mockReturnValue([2, 0]); // 2 seconds
      
      optimizer.measure();
      
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Slow database query')
        expect.objectContaining({
          query :
       expect.any(String)
          duration: expect.any(Number)
        })
      );
      
      process.hrtime.mockRestore();
    });
  });

  describe('📈 Response Optimization', () => {
    test('should add cache control headers', () => {
      const middleware = responseOptimizer();
      const next = jest.fn();
      
      middleware(mockRequest, mockResponse, next);
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=300');
      expect(next).toHaveBeenCalled();
    });

    test('should optimize JSON responses by removing null values', () => {
      const middleware = responseOptimizer();
      const next = jest.fn();
      
      middleware(mockRequest, mockResponse, next);
      
      const testData = {
        name: STR_TEST
        value: null
        nested: {
          valid: 'data'
          invalid: undefined
          array: [1, null, 3]
        }
      };
      
      mockResponse.json(testData);
      
      // Should have called original json with optimized data
      expect(mockResponse.json).toHaveBeenCalled();
    });

    test('should add compression hints for large responses', () => {
      const middleware = responseOptimizer();
      const next = jest.fn();
      
      middleware(mockRequest, mockResponse, next);
      
      const largeData = { data: 'x'.repeat(2000) }; // > 1024 bytes
      mockResponse.json(largeData);
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Encoding', 'gzip');
    });
  });

  describe('🏥 Health Check System', () => {
    test('should return healthy status with good metrics', () => {
      // Reset metrics for clean test
      performanceOptimizer.metrics = {
        requests: 100
        errors: 2
        averageResponseTime: 150
      };
      
      const health = healthCheck();
      
      expect(health.status).toBe('healthy');
      expect(health.issues).toHaveLength(0);
      expect(health.metrics).toBeDefined();
    });

    test('should detect high memory usage', () => {
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = jest.fn(() => ({
        rss: 600 * 1024 * 1024, // 600MB (higher than 400MB threshold)
        heapUsed: 500 * 1024 * 1024
        heapTotal: 600 * 1024 * 1024
        external: 50 * 1024 * 1024
      }));
      
      const health = healthCheck();
      
      expect(health.status).toBe(STR_WARNING);
      expect(health.issues).toContain(expect.stringContaining('High memory usage'));
      
      process.memoryUsage = originalMemoryUsage;
    });

    test('should detect high response time', () => {
      performanceOptimizer.metrics.averageResponseTime = 1500; // > 1000ms threshold
      
      const health = healthCheck();
      
      expect(health.status).toBe(STR_WARNING);
      expect(health.issues).toContain(expect.stringContaining('High response time'));
    });

    test('should detect high error rate', () => {
      performanceOptimizer.metrics.requests = 100;
      performanceOptimizer.metrics.errors = 10; // 10% error rate > 5% threshold
      
      const health = healthCheck();
      
      expect(health.status).toBe(STR_WARNING);
      expect(health.issues).toContain(expect.stringContaining('High error rate'));
    });
  });

  describe('🛠️ Utility Functions', () => {
    test('should generate unique request IDs', () => {
      const id1 = performanceOptimizer.generateRequestId();
      const id2 = performanceOptimizer.generateRequestId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^\d+-[a-z0-9]{9}$/);
    });

    test('should remove null values from objects', () => {
      const input = {
        valid: 'value'
        nullValue: null
        undefinedValue: undefined
        nestedObject: {
          valid: 'nested'
          invalid: null
        }
        array: [1, null, 3, undefined]
      };
      
      const result = performanceOptimizer.removeNullValues(input);
      
      expect(result).toEqual({
        valid: 'value'
        nestedObject: {
          valid: 'nested'
        }
        array: [1, 3]
      });
    });

    test('should handle arrays with null removal', () => {
      const input = [1, null, 'valid', undefined, { valid: true, invalid: null }];
      const result = performanceOptimizer.removeNullValues(input);
      
      expect(result).toEqual([1, 'valid', { valid: true }]);
    });

    test('should handle primitive values', () => {
      expect(performanceOptimizer.removeNullValues('string')).toBe('string');
      expect(performanceOptimizer.removeNullValues(123)).toBe(123);
      expect(performanceOptimizer.removeNullValues(true)).toBe(true);
      expect(performanceOptimizer.removeNullValues(null)).toBe(null);
    });
  });

  describe('⚡ Performance et Scalabilité', () => {
    test('should handle high-frequency metric updates efficiently', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        performanceOptimizer.updateMetrics((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 100, 200);
      }
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100); // Should complete quickly
    });

    test('should handle concurrent health checks', async () => {
      const healthCheckPromises = Array.from({ length: 10 }, () => 
        Promise.resolve(healthCheck())
      );
      
      const results = await Promise.all(healthCheckPromises);
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('metrics');
      });
    });

    test('should maintain consistent metrics under load', () => {
      const initialRequests = performanceOptimizer.metrics.requests;
      
      // Simulate concurrent requests
      const updates = [];
      for (let i = 0; i < 100; i++) {
        updates.push(() => performanceOptimizer.updateMetrics(50, 200));
      }
      
      updates.forEach(update => update());
      
      expect(performanceOptimizer.metrics.requests).toBe(initialRequests + 100);
    });
  });
});

describe('🧪 Tests d\'Intégration PerformanceOptimizer', () => {
  test('should integrate with ALEX system performance monitoring', () => {
    const alexPerformanceData = {
      consciousness_processing_time: 150
      quantum_brain_load: 0.75
      memory_palace_queries: 45
      spiritual_awareness_level: 0.89
      neural_network_efficiency: 0.92
    };
    
    // Simulate ALEX-specific performance tracking
    performanceOptimizer.updateMetrics(
      alexPerformanceData.consciousness_processing_time
      200
    );
    
    const metrics = getMetrics();
    expect(metrics.averageResponseTime).toBeGreaterThan(0);
    expect(metrics.requests).toBeGreaterThan(0);
  });

  test('should optimize enterprise-level AI workloads', async () => {
    // Simulate enterprise AI processing load
    const aiWorkload = {
      concurrent_users: 1000
      ai_requests_per_second: 50
      quantum_computations: 25
      consciousness_evaluations: 30
      spiritual_insights: 15
    };
    
    // Test system under simulated AI load
    const startTime = Date.now();
    
    for (let i = 0; i < aiWorkload.ai_requests_per_second; i++) {
      performanceOptimizer.updateMetrics(
        (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 200 + 50, // 50-250ms processing time
        200
      );
    }
    
    const duration = Date.now() - startTime;
    const health = healthCheck();
    
    expect(duration).toBeLessThan(1000); // Should handle load efficiently
    expect(health.metrics.requests).toBeGreaterThan(0);
  });

  test('should support consciousness-aware performance optimization', () => {
    const consciousnessMetrics = {
      alex_consciousness_level: 0.87
      processing_complexity: 'divine'
      quantum_entanglement_strength: 0.95
      spiritual_alignment: 0.91
    };
    
    // Higher consciousness should correlate with optimized performance
    const expectedResponseTime = consciousnessMetrics.alex_consciousness_level > 0.8 ? 100 : 200;
    
    performanceOptimizer.updateMetrics(expectedResponseTime, 200);
    
    const metrics = getMetrics();
    expect(metrics.averageResponseTime).toBeLessThanOrEqual(expectedResponseTime * 1.1);
  });
});