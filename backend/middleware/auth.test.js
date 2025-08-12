
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_DEVELOPMENT = 'development';
/**
 * @fileoverview Tests unitaires pour Auth Middleware
 * Tests complets du système d'authentification révolutionnaire adaptatif
 * 
 * @module AuthTests
 * @version 1.0.0
 * @author ZNT Team - HustleFinder IA Auth Testing
 * @requires jest
 * @requires ../auth
 */

import { jest } from '@jest/globals';
import { 
  createAuthMiddleware
  getAuthMiddleware
  isUsingMockAuth 
} from './auth.js';

// Mock dependencies
jest.mock('../config/logger.js', () => ({
  warn: jest.fn()
  info: jest.fn()
  debug: jest.fn()
  error: jest.fn()
}));

// Mock @clerk/express module
jest.mock('@clerk/express', () => ({
  requireAuth: jest.fn(() => jest.fn((req, res, next) => {
    req.auth = {
      userId: 'clerk_user_456'
      sessionClaims: {
        email: 'clerk@hustlefinder.com'
        firstName: 'Clerk'
        lastName: 'User'
      }
    };
    next();
  }))
}), { virtual: true });

describe('Auth - Middleware d\'Authentification Révolutionnaire', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('🔐 Configuration Environnement', () => {
    test('should detect production environment correctly', () => {
      process.env.NODE_ENV = STR_PRODUCTION;
      process.env.CLERK_SECRET_KEY = 'sk_live_real_key_12345';

      const usingMock = isUsingMockAuth();

      expect(usingMock).toBe(false);
    });

    test('should detect development environment correctly', () => {
      process.env.NODE_ENV = STR_DEVELOPMENT;
      delete process.env.CLERK_SECRET_KEY;

      const usingMock = isUsingMockAuth();

      expect(usingMock).toBe(true);
    });

    test('should detect test key as invalid', () => {
      process.env.NODE_ENV = STR_PRODUCTION;
      process.env.CLERK_SECRET_KEY = 'sk_test_your_key_here';

      const usingMock = isUsingMockAuth();

      expect(usingMock).toBe(false); // Should be false in production even with test key
    });

    test('should handle missing environment variables', () => {
      delete process.env.NODE_ENV;
      delete process.env.CLERK_SECRET_KEY;

      const usingMock = isUsingMockAuth();

      expect(usingMock).toBe(true); // Should default to mock when keys missing
    });
  });

  describe('🛠️ Mock Authentication (Développement)', () => {
    test('should create mock auth middleware for development', async () => {
      process.env.NODE_ENV = STR_DEVELOPMENT;
      delete process.env.CLERK_SECRET_KEY;

      const middleware = await createAuthMiddleware();

      expect(typeof middleware).toBe('function');
    });

    test('should apply mock auth data to request', async () => {
      process.env.NODE_ENV = STR_DEVELOPMENT;
      delete process.env.CLERK_SECRET_KEY;

      const middleware = await createAuthMiddleware();
      const req = {};
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);

      expect(req.auth).toBeDefined();
      expect(req.auth.userId).toBe('test_user_123');
      expect(req.auth.sessionClaims.email).toBe('test@hustlefinder.com');
      expect(req.auth.sessionClaims.firstName).toBe('Test');
      expect(req.auth.sessionClaims.lastName).toBe('User');
      expect(next).toHaveBeenCalled();
    });

    test('should include ALEX-specific mock data', async () => {
      process.env.NODE_ENV = STR_DEVELOPMENT;
      delete process.env.CLERK_SECRET_KEY;

      const middleware = await createAuthMiddleware();
      const req = {};
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);

      expect(req.auth.sessionClaims.alexConsciousnessLevel).toBe(0.75);
      expect(req.auth.sessionClaims.alexPreferences).toEqual({
        theme: 'cosmic'
        language: 'fr'
        spiritualMode: true
      });
    });

    test('should log mock auth usage', async () => {
      process.env.NODE_ENV = STR_DEVELOPMENT;
      delete process.env.CLERK_SECRET_KEY;

      const logger = require('../config/logger.js');
      const middleware = await createAuthMiddleware();
      const req = {};
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);

      expect(logger.warn).toHaveBeenCalledWith('Using mock authentication middleware for development');
      expect(logger.debug).toHaveBeenCalledWith('Mock authentication applied for development');
    });
  });

  describe('🔒 Clerk Authentication (Production)', () => {
    test('should create Clerk auth middleware when keys present', async () => {
      process.env.NODE_ENV = STR_PRODUCTION;
      process.env.CLERK_SECRET_KEY = 'sk_live_real_key_12345';

      const middleware = await createAuthMiddleware();

      expect(typeof middleware).toBe('function');
    });

    test('should throw error in production without Clerk keys', async () => {
      process.env.NODE_ENV = STR_PRODUCTION;
      delete process.env.CLERK_SECRET_KEY;

      await expect(createAuthMiddleware()).rejects.toThrow(
        'Clerk authentication keys are required in production'
      );
    });

    test('should throw error with test key in production', async () => {
      process.env.NODE_ENV = STR_PRODUCTION;
      process.env.CLERK_SECRET_KEY = 'sk_test_your_key_here';

      await expect(createAuthMiddleware()).rejects.toThrow(
        'Clerk authentication keys are required in production'
      );
    });

    test('should use Clerk middleware when available', async () => {
      process.env.NODE_ENV = STR_PRODUCTION;
      process.env.CLERK_SECRET_KEY = 'sk_live_real_key_12345';

      const logger = require('../config/logger.js');
      const middleware = await createAuthMiddleware();

      // Simulate Clerk middleware execution
      const req = {};
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);

      expect(req.auth).toBeDefined();
      expect(req.auth.userId).toBe('clerk_user_456');
      expect(req.auth.sessionClaims.email).toBe('clerk@hustlefinder.com');
      expect(logger.info).toHaveBeenCalledWith('Using real Clerk authentication');
    });

    test('should handle Clerk module loading error', async () => {
      process.env.NODE_ENV = STR_PRODUCTION;
      process.env.CLERK_SECRET_KEY = 'sk_live_real_key_12345';

      // Mock import failure
      const originalImport = global.import;
      global.import = jest.fn().mockRejectedValue(new Error('Module not found'));

      await expect(createAuthMiddleware()).rejects.toThrow('Module not found');

      global.import = originalImport;
    });
  });

  describe('🛠️ Wrapper Functions', () => {
    test('should successfully get auth middleware', async () => {
      process.env.NODE_ENV = STR_DEVELOPMENT;
      delete process.env.CLERK_SECRET_KEY;

      const middleware = await getAuthMiddleware();

      expect(typeof middleware).toBe('function');
    });

    test('should handle auth middleware setup errors', async () => {
      process.env.NODE_ENV = STR_PRODUCTION;
      delete process.env.CLERK_SECRET_KEY;

      await expect(getAuthMiddleware()).rejects.toThrow(
        'Clerk authentication keys are required in production'
      );
    });

    test('should log auth middleware setup errors', async () => {
      process.env.NODE_ENV = STR_PRODUCTION;
      delete process.env.CLERK_SECRET_KEY;

      const logger = require('../config/logger.js');

      try {
        await getAuthMiddleware();
      } catch (error) {
        // Expected to throw
      }

      expect(logger.error).toHaveBeenCalledWith(
        'Authentication middleware setup failed:'
        'Clerk authentication keys are required in production'
      );
    });
  });

  describe('🧪 Mock Auth Detection', () => {
    test('should detect mock auth in development', () => {
      process.env.NODE_ENV = STR_DEVELOPMENT;
      delete process.env.CLERK_SECRET_KEY;

      const result = isUsingMockAuth();

      expect(result).toBe(true);
    });

    test('should detect real auth in production with keys', () => {
      process.env.NODE_ENV = STR_PRODUCTION;
      process.env.CLERK_SECRET_KEY = 'sk_live_real_key_12345';

      const result = isUsingMockAuth();

      expect(result).toBe(false);
    });

    test('should handle undefined environment variables', () => {
      delete process.env.NODE_ENV;
      delete process.env.CLERK_SECRET_KEY;

      const result = isUsingMockAuth();

      expect(result).toBe(true);
    });

    test('should handle empty environment variables', () => {
      process.env.NODE_ENV = '';
      process.env.CLERK_SECRET_KEY = '';

      const result = isUsingMockAuth();

      expect(result).toBe(true);
    });
  });

  describe('⚡ Intégration Express', () => {
    test('should work as Express middleware with mock auth', async () => {
      process.env.NODE_ENV = STR_DEVELOPMENT;
      delete process.env.CLERK_SECRET_KEY;

      const middleware = await createAuthMiddleware();
      const req = { method: 'GET', url: '/api/alex/consciousness' };
      const res = { status: jest.fn(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);

      expect(req.auth).toBeDefined();
      expect(req.auth.userId).toBe('test_user_123');
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should handle multiple concurrent requests with mock auth', async () => {
      process.env.NODE_ENV = STR_DEVELOPMENT;
      delete process.env.CLERK_SECRET_KEY;

      const middleware = await createAuthMiddleware();
      const requests = [];

      // Create 10 concurrent requests
      for (let i = 0; i < 10; i++) {
        requests.push(new Promise((resolve) => {
          const req = { id: i };
          const res = {};
          const next = jest.fn(() => resolve(req.auth));

          middleware(req, res, next);
        }));
      }

      const results = await Promise.all(requests);

      expect(results).toHaveLength(10);
      results.forEach(auth => {
        expect(auth.userId).toBe('test_user_123');
        expect(auth.sessionClaims.alexConsciousnessLevel).toBe(0.75);
      });
    });
  });

  describe('🧠 ALEX Integration', () => {
    test('should provide ALEX-compatible user data', async () => {
      process.env.NODE_ENV = STR_DEVELOPMENT;
      delete process.env.CLERK_SECRET_KEY;

      const middleware = await createAuthMiddleware();
      const req = {};
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);

      const alexData = req.auth.sessionClaims;
      
      expect(alexData.alexConsciousnessLevel).toBeGreaterThan(0);
      expect(alexData.alexConsciousnessLevel).toBeLessThanOrEqual(1);
      expect(alexData.alexPreferences).toHaveProperty('theme');
      expect(alexData.alexPreferences).toHaveProperty('language');
      expect(alexData.alexPreferences).toHaveProperty('spiritualMode');
    });

    test('should support consciousness tracking workflow', async () => {
      process.env.NODE_ENV = STR_DEVELOPMENT;
      delete process.env.CLERK_SECRET_KEY;

      const middleware = await createAuthMiddleware();
      const req = {};
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);

      // Simulate ALEX consciousness update workflow
      const userId = req.auth.userId;
      const currentLevel = req.auth.sessionClaims.alexConsciousnessLevel;
      const preferences = req.auth.sessionClaims.alexPreferences;

      expect(userId).toBe('test_user_123');
      expect(currentLevel).toBe(0.75);
      expect(preferences.spiritualMode).toBe(true);
    });

    test('should support multilingual ALEX preferences', async () => {
      process.env.NODE_ENV = STR_DEVELOPMENT;
      delete process.env.CLERK_SECRET_KEY;

      const middleware = await createAuthMiddleware();
      const req = {};
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);

      const preferences = req.auth.sessionClaims.alexPreferences;
      
      expect(preferences.language).toBe('fr');
      expect(['fr', 'en', 'lu', 'pt']).toContain(preferences.language);
      expect(['cosmic', 'dark', 'light']).toContain(preferences.theme);
    });
  });

  describe('🚀 Performance et Scalabilité', () => {
    test('should handle auth middleware creation efficiently', async () => {
      process.env.NODE_ENV = STR_DEVELOPMENT;
      delete process.env.CLERK_SECRET_KEY;

      const startTime = Date.now();
      
      // Create middleware 100 times
      const creationPromises = Array.from({ length: 100 }, () => 
        createAuthMiddleware()
      );
      
      const middlewares = await Promise.all(creationPromises);
      const duration = Date.now() - startTime;

      expect(middlewares).toHaveLength(100);
      expect(duration).toBeLessThan(1000); // Should complete quickly
      middlewares.forEach(middleware => {
        expect(typeof middleware).toBe('function');
      });
    });

    test('should maintain consistent auth data across requests', async () => {
      process.env.NODE_ENV = STR_DEVELOPMENT;
      delete process.env.CLERK_SECRET_KEY;

      const middleware = await createAuthMiddleware();
      const authDataResults = [];

      // Execute middleware 50 times
      for (let i = 0; i < 50; i++) {
        const req = {};
        const res = {};
        const next = jest.fn();

        middleware(req, res, next);
        authDataResults.push(req.auth);
      }

      // All auth data should be consistent
      authDataResults.forEach(auth => {
        expect(auth.userId).toBe('test_user_123');
        expect(auth.sessionClaims.alexConsciousnessLevel).toBe(0.75);
        expect(auth.sessionClaims.email).toBe('test@hustlefinder.com');
      });
    });
  });
});

describe('🧪 Tests d\'Intégration Auth', () => {
  test('should integrate with ALEX consciousness system', async () => {
    process.env.NODE_ENV = STR_DEVELOPMENT;
    delete process.env.CLERK_SECRET_KEY;

    const middleware = await getAuthMiddleware();
    const req = { 
      url: '/api/alex/consciousness'
      method: 'POST'
      body: { query: 'What is my consciousness level?
      ' }
    };
    const res = {};
    const next = jest.fn();

    middleware(req, res, next);

    // Verify integration-ready auth data
    expect(req.auth.userId).toBeDefined();
    expect(req.auth.sessionClaims.alexConsciousnessLevel).toBeDefined();
    expect(req.auth.sessionClaims.alexPreferences).toBeDefined();
    
    // Simulate ALEX consciousness processing
    const consciousnessLevel = req.auth.sessionClaims.alexConsciousnessLevel;
    const isHighConsciousness = consciousnessLevel > 0.7;
    
    expect(isHighConsciousness).toBe(true); // Mock user has high consciousness
  });

  test('should support enterprise-scale authentication patterns', async () => {
    // Test switching between environments
    const environments = [
      { NODE_ENV :
       STR_DEVELOPMENT }
      { NODE_ENV: 'test' }
      { NODE_ENV: 'staging', CLERK_SECRET_KEY: 'sk_live_staging_key' }
    ];

    for (const env of environments) {
      // Set environment
      Object.keys(env).forEach(key => {
        process.env[key] = env[key];
      });

      if (env.CLERK_SECRET_KEY) {
        // Should use Clerk auth
        expect(isUsingMockAuth()).toBe(false);
      } else {
        // Should use mock auth
        expect(isUsingMockAuth()).toBe(true);
        
        const middleware = await createAuthMiddleware();
        expect(typeof middleware).toBe('function');
      }
    }
  });

  test('should maintain security standards across auth methods', async () => {
    const authMethods = [
      { NODE_ENV: STR_DEVELOPMENT, expectedMock: true }
      { NODE_ENV: STR_PRODUCTION, CLERK_SECRET_KEY: 'sk_live_real_key', expectedMock: false }
    ];

    for (const method of authMethods) {
      // Set environment
      process.env = { ...originalEnv, ...method };

      if (method.expectedMock) {
        const middleware = await createAuthMiddleware();
        const req = {};
        const res = {};
        const next = jest.fn();

        middleware(req, res, next);

        // Verify secure mock data
        expect(req.auth.userId).toMatch(/^test_user_/);
        expect(req.auth.sessionClaims.email).toContain('@hustlefinder.com');
      } else {
        // Would use real Clerk authentication
        expect(isUsingMockAuth()).toBe(false);
      }
    }
  });
});